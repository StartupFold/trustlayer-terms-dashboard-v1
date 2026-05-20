"""Backend application entrypoint for the FastAPI service.

Sets up FastAPI, CORS, and mounts API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes import router as auth_router


app = FastAPI()

# Allow all origins for now (adjust in production)
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")


@app.get("/")
def health_check():
	return {"status": "ok"}
