from fastapi import FastAPI

app = FastAPI(title="Compiler Visualizer API")


@app.get("/api/health")
def health():
    return {"status": "ok"}
