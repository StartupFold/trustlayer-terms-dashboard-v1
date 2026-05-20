"""Backend application entrypoint for the FastAPI service.

Sets up FastAPI, CORS, and mounts API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes import router as auth_router
from app.routes.policy_routes import router as policy_router


app = FastAPI(
    title="TrustLayer Terms Dashboard",
    description="API for managing Terms & Conditions",
    version="1.0.0",
)

# Allow all origins for now (adjust in production)
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(policy_router, prefix="/api")


@app.get("/")
def health_check():
	return {"status": "ok"}
