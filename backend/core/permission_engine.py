# Copyright 2026 sharexpress
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
#
from typing import List, Dict, Any
from models.File_setup import Action, Role


class PermissionEngine:
    ROLE_DEFAULTS = {
        Role.OWNER: [
            Action.VIEW,
            Action.DOWNLOAD,
            Action.EDIT,
            Action.DELETE,
            Action.SHARE,
            Action.UPLOAD,
        ],
        Role.ADMIN: [
            Action.VIEW,
            Action.DOWNLOAD,
            Action.EDIT,
            Action.DELETE,
            Action.SHARE,
        ],
        Role.EDITOR: [
            Action.VIEW,
            Action.DOWNLOAD,
            Action.EDIT,
        ],
        Role.VIEWER: [
            Action.VIEW,
        ],
    }

    DEFAULT_FILE_PERMISSION = [Action.VIEW]

    @classmethod
    def is_allowed(
        cls,
        user_id: str,
        session: List[Dict[str, Any]],
        file_doc: Dict[str, Any],
        action: Action,
    ) -> bool:

        role = None
        for participant in session:
            if participant["user_id"] == user_id:
                role = participant["role"]
                break

        if not role:
            return False

        file_permissions = file_doc.get("file_permissions")

        if file_permissions:
            for perm in file_permissions:
                if perm["user_id"] == user_id:
                    return action in perm["allowed_actions"]

        role_actions = cls.ROLE_DEFAULTS.get(role, cls.DEFAULT_FILE_PERMISSION)

        return action in role_actions
