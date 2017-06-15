# -*- coding: UTF-8 -*-
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash


from business import user_business


def add(user_ID, password, kwargs):
    hashed_password = generate_password_hash(password)
    return user_business.add(user_ID, hashed_password, kwargs)


def authenticate(user_ID, password):
    user = user_business.get_by_user_ID(user_ID)
    if user and check_password_hash(user.password, password):
        user.id = str(user.id)
        return user
    return False
