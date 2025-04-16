import pytest
from unittest.mock import MagicMock
from src.controllers.usercontroller import UserController
from src.util.dao import DAO

@pytest.fixture
def user_controller():
    dao_mock = MagicMock(DAO)
    controller = UserController(dao=dao_mock)
    return controller

def test_invalid_email_format(user_controller):
    with pytest.raises(ValueError):
        user_controller.get_user_by_email("invalid-email")

def test_empty_email_string(user_controller):
    with pytest.raises(ValueError):
        user_controller.get_user_by_email("")

def test_valid_email_no_user_found(user_controller):
    user_controller.dao.find.return_value = []
    
    result = user_controller.get_user_by_email("user@example.com")
    
    # Assert that the result is None because no users were found.
    # The function should return None but right now there's an index error instead.
    # The function will be fixed later to return None and then the test will pass.
    assert result is None

def test_valid_email_single_user_found(user_controller):
    mock_user = {"name": "Test user"}
    user_controller.dao.find.return_value = [mock_user]
    result = user_controller.get_user_by_email("user@example.com")
    assert result == mock_user

def test_valid_email_multiple_users_found(user_controller, capsys):
    mock_user1 = {"name": "User one"}
    mock_user2 = {"name": "User two"}
    user_controller.dao.find.return_value = [mock_user1, mock_user2]

    result = user_controller.get_user_by_email("user@example.com")

    assert result == mock_user1
    captured = capsys.readouterr()
    assert "Error: more than one user found with mail user@example.com" in captured.out

def test_database_exception(user_controller):
    user_controller.dao.find.side_effect = Exception("Database failure")
    with pytest.raises(Exception) as exc_info:
        user_controller.get_user_by_email("user@example.com")
    assert "Database failure" in str(exc_info.value)
