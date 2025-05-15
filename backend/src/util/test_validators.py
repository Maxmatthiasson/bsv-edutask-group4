def get_test_validator(collection_name):
    if collection_name == "task":
        return {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["title", "description"],
                "properties": {
                    "_id": {},
                    "title": {
                        "bsonType": "string",
                        "description": "Must be a string and is required"
                    },
                    "description": {
                        "bsonType": "string",
                        "description": "Must be a string and is required"
                    },
                    "startdate": {
                        "bsonType": "date",
                        "description": "Must be a datetime if provided"
                    }
                },
                "additionalProperties": False
            }
        }
    raise ValueError("Unknown test collection")
