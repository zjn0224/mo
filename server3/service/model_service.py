#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 11:00pm
# @function : Getting all of the model of statics analysis
# @running  : python
# Further to FIXME of None
"""

from service import job_service
from business import model_business, ownership_business, user_business
from service.job_service import split_supervised_input
from utility import json_utility
from lib.models import ks
from service import controller


def get_all_public_model():
    models = [obj.model.to_mongo().to_dict() for obj in ownership_business.
        list_ownership_by_type_and_private('model', False)]
    print('models', len(models))
    return models


def list_public_model_name():
    all_names = []
    for tool in get_all_public_model():
        all_names.append(tool.model.name)
    return all_names


def add_model_with_ownership(user_ID, is_private, name, description, category,
                             target_py_code, entry_function,
                             to_code_function, parameter_spec, input):
    """
    add_model_with_ownership
    :param user_ID:
    :param is_private:
    :param name:
    :param description:
    :param category:
    :param target_py_code:
    :param entry_function:
    :param to_code_function:
    :param parameter_spec:
    :param input:
    :return:
    """
    model = model_business.add(name, description, category,
                               target_py_code, entry_function,
                               to_code_function, parameter_spec, input)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, model=model)
    return model


def run_model(conf, project_id, staging_data_set_id, model_id, **kwargs):
    """
    run model by model_id and the parameter config

    :param conf:
    :param project_id:
    :param staging_data_set_id:
    :param model_id:
    :param kwargs:
    :return:
    """
    model = model_business.get_by_model_id(model_id)
    f = model.entry_function
    if model['category'] == 0:
        conf = manage_supervised_input(conf, staging_data_set_id, **kwargs)
    return job_service.run_code(conf, project_id, staging_data_set_id, model, f)


# controller.run_code(conf, model)


def model_to_code(conf, project_id, staging_data_set_id, model_id, **kwargs):
    """
    run model by model_id and the parameter config

    :param conf:
    :param project_id:
    :param staging_data_set_id:
    :param model_id:
    :param kwargs:
    :return:
    """
    model = model_business.get_by_model_id(model_id)
    f = model.to_code_function
    head_str = None
    if model['category'] == 0:
        head_str = manage_supervised_input_to_str(conf, staging_data_set_id,
                                                  **kwargs)
    return job_service.run_code(conf, project_id, staging_data_set_id,
                                model, f, head_str)


# controller.run_code(conf, model)


def temp():
    add_model_with_ownership(
        'system',
        False,
        'keras_seq',
        'keras_seq from keras',
        0,
        '/lib/keras_seq',
        'keras_seq',
        'keras_seq_to_str',
        ks.KERAS_SEQ_SPEC,
        {'type': 'ndarray', 'n': None}
    )


if __name__ == '__main__':
    pass


# temp()


def manage_supervised_input(conf, staging_data_set_id, **kwargs):
    """
    deal with input when supervised learning
    :param conf:
    :param staging_data_set_id:
    :return:
    """
    x_fields = conf['fit']['x_train']
    y_fields = conf['fit']['y_train']
    schema = kwargs.pop('schema')
    obj = split_supervised_input(staging_data_set_id, x_fields, y_fields,
                                 schema)
    conf['fit']['x_train'] = obj['x_tr']
    conf['fit']['y_train'] = obj['y_tr']
    conf['fit']['x_val'] = obj['x_te']
    conf['fit']['y_val'] = obj['y_te']
    conf['evaluate']['x_test'] = obj['x_te']
    conf['evaluate']['y_test'] = obj['y_te']
    return conf


def line_split_for_long_fields(field_str):
    field_str = field_str.split(' ')
    for i in range(len(field_str) // 10):
        field_str[i * 10 + 1] += '\n'
    return ' '.join(field_str)


def manage_supervised_input_to_str(conf, staging_data_set_id, **kwargs):
    """
    deal with input when supervised learning
    :param conf:
    :param staging_data_set_id:
    :return:
    """
    x_fields = conf['fit']['x_train']
    y_fields = conf['fit']['y_train']
    schema = kwargs.pop('schema')
    # restore data to variable str
    conf['fit']['x_train'] = 'x_train'
    conf['fit']['y_train'] = 'y_train'
    conf['fit']['x_val'] = 'x_test'
    conf['fit']['y_val'] = 'y_test'
    conf['evaluate']['x_test'] = 'x_test'
    conf['evaluate']['y_test'] = 'x_test'

    code_str = "schema = '%s'\n" % schema
    # str += 'conf = %s\n' % conf
    code_str += "staging_data_set_id = '%s'\n" % staging_data_set_id
    x_str = "x_fields = %s\n" % x_fields
    y_str = "y_fields = %s\n" % y_fields
    x_str = line_split_for_long_fields(x_str)
    y_str = line_split_for_long_fields(y_str)
    code_str += x_str
    code_str += y_str
    code_str += "from libs.service import job_service\n"
    code_str += "obj = job_service.split_supervised_input(" \
                "staging_data_set_id, x_fields, y_fields, schema)\n"
    code_str += "x_train = obj['x_tr']\n"
    code_str += "y_train = obj['y_tr']\n"
    code_str += "x_test = obj['x_te']\n"
    code_str += "y_test = obj['y_te']\n"

    return code_str
