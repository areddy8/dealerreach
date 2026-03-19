import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class PipelineJobResponse(BaseModel):
    id: uuid.UUID
    quote_request_id: uuid.UUID
    status: str
    progress: Optional[Dict[str, Any]]
    error_message: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}
