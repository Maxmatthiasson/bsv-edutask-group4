# Integration tests for create function in dao.py

import pytest
from pymongo.errors import WriteError
from src.util.dao import DAO
from src.util.test_validators import get_test_validator
import pymongo
from src.util import dao

@pytest.fixture(scope="function")
def task_dao(monkeypatch):
    mongo_url = "mongodb://root:root@localhost:27017/edutask_test?authSource=admin"
    monkeypatch.setenv("MONGO_URL", mongo_url)

    dao.getValidator = get_test_validator

    client = pymongo.MongoClient(mongo_url)
    db = client.get_database("edutask_test")

    if "task" in db.list_collection_names():
        db.drop_collection("task")

    db.create_collection("task", validator=get_test_validator("task"))
    dao_instance = DAO("task")

    yield dao_instance

    dao_instance.drop()


# TC01 - All required fields present with correct types
def test_create_valid_task(task_dao):
    task = {
        "title": "Read Book",
        "description": "Read the assigned chapters for class",
    }

    result = task_dao.create(task)

    assert "_id" in result


# TC02 - Missing a required field. In this case a desription.
def test_create_missing_required_field(task_dao):
    task = {
        "title": "No Description"
    }

    with pytest.raises(WriteError):
        task_dao.create(task)


# TC03 - Incorrect data type in a field. startdate should be a datetime object.
def test_create_incorrect_data_type(task_dao):
    task = {
        "title": "Boolean Error",
        "description": "Trying to insert wrong type",
        "startdate": "not-a-date"
    }

    with pytest.raises(WriteError):
        task_dao.create(task)


# TC04 - Duplicate value in a field with uniqueness constraint. In this case using the same title.
def test_create_duplicate_unique_field(task_dao):
    task1 = {
        "title": "Unique Title",
        "description": "First task"
    }
    task2 = {
        "title": "Unique Title",
        "description": "Second task"
    }

    task_dao.create(task1)
    
    with pytest.raises(WriteError):
        task_dao.create(task2)


# TC05: Extra field not defined in schema. Assumes that additionalProperties = false.
def test_create_with_extra_field(task_dao):
    task = {
        "title": "Extra Field Task",
        "description": "Has an undefined field",
        "unexpected": "this should cause an error"
    }

    with pytest.raises(WriteError):
        task_dao.create(task)
