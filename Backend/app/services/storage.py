import base64
import uuid
import mimetypes
from app.database import get_supabase
from app.config import get_settings

def upload_evidence(file_base64: str) -> str:
    """
    Decodes a base64 string and uploads it to Supabase Storage 'evidence' bucket.
    Returns the public URL of the uploaded file.
    """
    settings = get_settings()
    supabase = get_supabase()
    
    # 1. Parse base64
    if "," in file_base64:
        header, encoded = file_base64.split(",", 1)
        mime_type = header.split(":")[1].split(";")[0]
    else:
        encoded = file_base64
        mime_type = "image/jpeg" # Fallback
        
    file_data = base64.b64decode(encoded)
    
    # 2. Determine extension
    extension = mimetypes.guess_extension(mime_type) or ".bin"
    file_name = f"{uuid.uuid4()}{extension}"
    
    # 3. Upload to Supabase Storage
    # Bucket name: 'evidence'
    try:
        # Note: supabase-py storage API
        supabase.storage.from_("evidence").upload(
            path=file_name,
            file=file_data,
            file_options={"content-type": mime_type}
        )
        
        # 4. Get Public URL
        # Assumes the bucket is public
        url = f"{settings.supabase_url}/storage/v1/object/public/evidence/{file_name}"
        return url
    except Exception as e:
        print(f"Error uploading to storage: {e}")
        raise e
