import os
from supabase import create_client, Client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(url, key)

# Delete all chat sessions and agents
print("Deleting chat_sessions...")
supabase.table("chat_sessions").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

print("Deleting agents...")
supabase.table("agents").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

print("Cleanup complete!")
