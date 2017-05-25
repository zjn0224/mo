# -*- coding: UTF-8 -*-
from bson import ObjectId
from business import project_business
from business import staging_data_set_business, staging_data_business


def add_staging_data_set(sds_name, sds_description, project_id,
                         data_set):
    # get project object
    project = project_business.get_by_id(project_id)

    # create new staging data set
    sds = staging_data_set_business.add(sds_name, sds_description, project)

    # copy data from data(raw) to staging data


def add_staging_data_set_by_objects(sds_name, sds_description, project_id,
                         data_objects):
    # get project object
    project = project_business.get_by_id(project_id)

    # create new staging data set
    sds = staging_data_set_business.add(sds_name, sds_description, project)

    # copy data from data(raw) to staging data
    try:
        for data_obj in data_objects:
            # data_obj = data_obj.to_mongo().to_dict()
            data_obj_son_format = data_obj.to_mongo()
            # print data_obj
            staging_data_business.add_by_son_format(sds, data_obj_son_format)
    except Exception:
        staging_data_set_business.remove_by_id(sds.id)
        raise RuntimeError("Create staging data set failed")


def list_fields(staging_data_set_name):
    sds_object = staging_data_set_business.get_by_name(staging_data_set_name)
    sd_object = staging_data_business.get_first_one_by_staging_data_set(
                 sds_object)
    sd_object = sd_object.to_mongo().to_dict()
    return [[k, type(v).__name__]for k, v in sd_object.iteritems()]




# def get_by_staging_data_set_id_and_fields(staging_data_set_id, fields):
#     return staging_data_business.get_by_staging_data_set_and_fields(
#         staging_data_set_id, fields)
