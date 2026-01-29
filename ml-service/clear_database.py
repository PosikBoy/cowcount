#!/usr/bin/env python3
"""
Script to clear the database and optionally delete uploaded files
"""
import os
import sys
from pathlib import Path
from app.database import engine, Base
from app.models import Recognition

def clear_database(delete_files=False):
    """
    Clear all data from the database
    
    Args:
        delete_files: If True, also delete uploaded files
    """
    print("🗑️  Clearing database...")
    
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    print("✅ All tables dropped")
    
    # Recreate tables
    Base.metadata.create_all(bind=engine)
    print("✅ Tables recreated")
    
    if delete_files:
        print("\n🗑️  Deleting uploaded files...")
        uploads_dir = Path("../uploads")
        
        if uploads_dir.exists():
            deleted_count = 0
            for file in uploads_dir.iterdir():
                if file.is_file() and file.name != ".gitkeep":
                    file.unlink()
                    deleted_count += 1
            
            print(f"✅ Deleted {deleted_count} files")
        else:
            print("⚠️  Uploads directory not found")
    
    print("\n✨ Database cleared successfully!")

if __name__ == "__main__":
    print("=" * 50)
    print("CowCount Database Cleanup Tool")
    print("=" * 50)
    print()
    
    # Check if user wants to delete files
    delete_files = False
    if len(sys.argv) > 1 and sys.argv[1] == "--delete-files":
        delete_files = True
        print("⚠️  WARNING: This will delete ALL uploaded files!")
    else:
        print("ℹ️  This will clear the database but keep uploaded files")
        print("   Use --delete-files flag to also delete uploaded files")
    
    print()
    response = input("Are you sure you want to continue? (yes/no): ")
    
    if response.lower() in ["yes", "y"]:
        clear_database(delete_files)
    else:
        print("❌ Operation cancelled")
        sys.exit(0)
