export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member"
};

export const AvailableUserRoles = Object.values(UserRolesEnum);  // returns array of object values

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in_progess",
    DONE: "done"
};

export const AvailableTaskStatuses = Object.values(TaskStatusEnum);