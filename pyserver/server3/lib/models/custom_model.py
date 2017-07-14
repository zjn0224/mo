import logging

import tensorflow as tf
import numpy as np

from server3.service.custom_log_handler import MetricsHandler


def custom_model(conf, model_fn, input, **kw):
    """

    :param model_fn:
    :param params:
    :param input:
    :param kw:
    :return:
    """
    train = input.pop('train', None)
    test = input.pop('test', None)
    categorical_cols = input.pop('categorical_cols', None)
    continuous_cols = input.pop('continuous_cols', None)
    label_col = input.pop('label_col', None)

    predict_x = kw.pop('predict_x', None)
    project_id = kw.pop('project_id', None)
    result_sds = kw.pop('result_sds', None)

    est_params = conf.get('estimator', None)
    fit_params = conf.get('fit', {})
    eval_params = conf.get('evaluate', {})

    if result_sds is None:
        raise RuntimeError('no result sds id passed to model')
    if train is None:
        raise RuntimeError('no train input')
    if continuous_cols is None:
        raise RuntimeError('no continuous_cols input')
    if project_id is None:
        raise RuntimeError('no project_id input')

    def train_input_fn():
        return input_fn(train, continuous_cols, categorical_cols, label_col)

    def eval_input_fn():
        return input_fn(test, continuous_cols, categorical_cols, label_col)

    tf.logging.set_verbosity(tf.logging.INFO)

    # add handler to catch tensorflow log message
    mh = MetricsHandler()
    # pass result staging data set for logger to save results
    mh.result_sds_id = result_sds
    mh.project_id = project_id
    logger = logging.getLogger('tensorflow')
    logger.setLevel(logging.DEBUG)
    logger.addHandler(mh)
    # init model
    estimator = tf.contrib.learn.Estimator(model_fn=model_fn,
                                           model_dir=None,
                                           config=None,
                                           params=est_params['args'])
    # fit
    estimator.fit(input_fn=train_input_fn, **fit_params['args'])
    result = {}
    # evaluate
    metrics = estimator.evaluate(input_fn=train_input_fn, **eval_params['args'])
    result.update({
        'eval_metrics': metrics
    })
    # predict
    if predict_x:
        predictions = estimator.predict(predict_x, as_iterable=True)
        result['predictions'] = predictions

    return result


# input_fn 返回 features 和 labels
#  features: A dict of `Tensor` keyed by column name.
#  labels: `Tensor` of shape [batch_size, 1] or [batch_size] labels of
#          dtype `int32` or `int64` in the range `[0, n_classes)`.
def input_fn(df, continuous_cols, categorical_cols=None, label_col=None):
    # Creates a dictionary mapping from each continuous feature column name (k) to
    # the values of that column stored in a constant Tensor.
    if categorical_cols is None and label_col is None:
        # unsupervised
        continuous_cols = [[[x] for x in df[k].values.astype(np.float32)]
                           for k in continuous_cols]
        continuous_cols = tf.concat(continuous_cols, axis=1)
        # continuous_cols = tf.constant(continuous_cols)
        return continuous_cols, None

    # supervised
    continuous_cols = {k: tf.constant(df[k].values)
                       for k in continuous_cols}

    # Creates a dictionary mapping from each categorical feature column name (k)
    # to the values of that column stored in a tf.SparseTensor.
    categorical_cols = {k: tf.SparseTensor(
        indices=[[i, 0] for i in range(df[k].size)],
        values=df[k].values,
        dense_shape=[df[k].size, 1])
        for k in categorical_cols}
    # Merges the two dictionaries into one.
    # feature_cols = dict(continuous_cols.items() + categorical_cols.items())
    feature_cols = continuous_cols.copy()
    feature_cols.update(categorical_cols)

    # Converts the label column into a constant Tensor.
    label = tf.constant(df[label_col].values)
    # Returns the feature columns and the label.
    return feature_cols, label


# Declare list of features, we only have one real-valued feature
def linear_regressor(features, labels, mode):
    # Build a linear model and predict values
    W = tf.get_variable("W", [1], dtype=tf.float64)
    b = tf.get_variable("b", [1], dtype=tf.float64)
    y = W * features['x'] + b
    # Loss sub-graph
    loss = tf.reduce_sum(tf.square(y - labels))
    # Training sub-graph
    global_step = tf.train.get_global_step()
    optimizer = tf.train.GradientDescentOptimizer(0.01)
    train = tf.group(optimizer.minimize(loss),
                     tf.assign_add(global_step, 1))
    # ModelFnOps connects subgraphs we built to the
    # appropriate functionality.
    return tf.contrib.learn.ModelFnOps(
        mode=mode, predictions=y,
        loss=loss,
        train_op=train)


if __name__ == '__main__':
    pass
    from server3.business import staging_data_set_business
    import pandas as pd

    COLUMNS = ["age", "workclass", "fnlwgt", "education", "education_num",
               "marital_status", "occupation", "relationship", "race", "gender",
               "capital_gain", "capital_loss", "hours_per_week",
               "native_country",
               "income_bracket"]
    df_train = pd.read_csv('train_file', names=COLUMNS, skipinitialspace=True)
    df_test = pd.read_csv('test_file', names=COLUMNS, skipinitialspace=True,
                          skiprows=1)
    LABEL_COLUMN = "label"
    df_train[LABEL_COLUMN] = (
        df_train["income_bracket"].apply(lambda x: ">50K" in x)).astype(int)
    df_test[LABEL_COLUMN] = (
        df_test["income_bracket"].apply(lambda x: ">50K" in x)).astype(int)
    # 添加一列 index，格式为string，作为"example_id_column"的输入
    df_train['index'] = df_train.index.astype(str)
    df_test['index'] = df_test.index.astype(str)

    # 将连续型和类别型特征分离开，为input做准备
    CATEGORICAL_COLUMNS = ["workclass", "education", "marital_status",
                           "occupation",
                           "relationship", "race", "gender", "native_country"]
    CONTINUOUS_COLUMNS = ["age", "education_num", "capital_gain",
                          "capital_loss", "hours_per_week", "index"]
    input = {
        'train': df_train,
        'test': df_test,
        'categorical_cols': CATEGORICAL_COLUMNS,
        'continuous_cols': CONTINUOUS_COLUMNS,
        'label_col': LABEL_COLUMN
    }

    params = {
        "example_id_column": 'index',
        "feature_columns": [["age", "education_num", "capital_gain",
                             "capital_loss", "hours_per_week"], ["race"]],
        "weight_column_name": None,
        "model_dir": None,
        "l1_regularization": 0.0,
        "l2_regularization": 0.5,
        "num_loss_partitions": 1,
        "kernels": None,
        "config": None,
    }

    sds = staging_data_set_business.get_by_id('595cb76ed123ab59779604c3')
    from server3.lib.models import sdca_model_fn

    custom_model(params, sdca_model_fn, input, result_sds=sds)
