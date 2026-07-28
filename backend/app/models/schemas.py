from pydantic import BaseModel, Field
from typing import Any


class ArtistSummary(BaseModel):
    id: str
    name: str
    stage_name: str | None = None
    genres: list[str] = Field(default_factory=list)
    roles: list[str] = Field(default_factory=list)
    city: str | None = None
    province: str | None = None
    active_from: int | None = None
    active_to: int | None = None
    influence_score: float = 0.0
    is_hub: bool = False
    generation: int | None = None


class SongSummary(BaseModel):
    id: str
    title: str
    year: int | None = None


class SourceCite(BaseModel):
    id: str
    title: str
    tier: int
    provider: str
    url: str | None = None
    excerpt: str | None = None


class ArtistDetail(ArtistSummary):
    bio: str | None = None
    languages: list[str] = Field(default_factory=list)
    relationships: list["RelationshipEdge"] = Field(default_factory=list)
    events: list["TimelineEvent"] = Field(default_factory=list)
    songs: list[SongSummary] = Field(default_factory=list)
    legacy_map: dict[str, Any] = Field(default_factory=dict)
    exile_places: list[str] = Field(default_factory=list)
    sources: list[SourceCite] = Field(default_factory=list)
    external_ids: dict[str, str | None] = Field(default_factory=dict)


class RelationshipEdge(BaseModel):
    type: str
    direction: str  # out | in
    target_id: str
    target_name: str
    source_cite: str | None = None


class PlaceNode(BaseModel):
    id: str
    name: str
    kind: str  # city | province | township | venue | studio
    province: str | None = None
    lat: float
    lng: float
    artist_count: int = 0
    genres: list[str] = Field(default_factory=list)


class GraphNode(BaseModel):
    id: str
    label: str
    kind: str
    genres: list[str] = Field(default_factory=list)
    city: str | None = None
    generation: int | None = None


class GraphLink(BaseModel):
    source: str
    target: str
    type: str


class GraphPayload(BaseModel):
    nodes: list[GraphNode]
    links: list[GraphLink]


class TimelineEvent(BaseModel):
    id: str
    year: int
    title: str
    description: str | None = None
    kind: str  # music | history | album | award
    related_artist_ids: list[str] = Field(default_factory=list)
    related_artist_names: list[str] = Field(default_factory=list)
    genre: str | None = None
    place: str | None = None


class GenreSummary(BaseModel):
    id: str
    name: str
    era_start: int | None = None
    origin_place: str | None = None
    artist_count: int = 0


class GenreDetail(GenreSummary):
    influenced_by: list[GenreSummary] = Field(default_factory=list)
    influenced: list[GenreSummary] = Field(default_factory=list)
    artists: list[ArtistSummary] = Field(default_factory=list)
    pioneers: list[ArtistSummary] = Field(default_factory=list)
    cultures: list[str] = Field(default_factory=list)
    instruments: list[str] = Field(default_factory=list)


class AIAskRequest(BaseModel):
    question: str
    artist_id: str | None = None


class AIAskResponse(BaseModel):
    answer: str
    sources: list[dict[str, Any]] = Field(default_factory=list)
    mode: str  # llm | graph


ArtistDetail.model_rebuild()
