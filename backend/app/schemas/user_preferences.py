from pydantic import BaseModel
from typing import Optional, Any


class UserPreferencesBase(BaseModel):
    favorite_cuisine: Optional[str] = None
    favorite_restaurants: Any = []
    dietary_restrictions: Any = []


class UserPreferencesResponse(UserPreferencesBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}
