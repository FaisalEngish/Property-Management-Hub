#!/usr/bin/env python3
import os
import shutil
import tarfile

def create_package():
    print("📦 Creating GitHub upload package...")
    
    # Source directory with all files
    source_dir = "hostpilotpro-github"
    archive_name = "hostpilotpro-github-ready.tar.gz"
    
    try:
        # Create tar.gz archive
        with tarfile.open(archive_name, "w:gz") as tar:
            # Add the entire directory
            tar.add(source_dir, arcname="hostpilotpro")
            
        # Check file size
        size = os.path.getsize(archive_name)
        size_mb = size / (1024 * 1024)
        
        print(f"✅ Created: {archive_name}")
        print(f"📊 Size: {size_mb:.1f} MB")
        print(f"📁 Ready for GitHub upload!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    create_package()