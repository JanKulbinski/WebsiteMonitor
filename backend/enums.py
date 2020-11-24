import enum
class FileStatus(enum.Enum):
    NEW = 'NEW',
    MODIFIED = 'MODIFIED',
    OLD = 'OLD',
    DELETED = 'DELETED'