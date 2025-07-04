#!/usr/bin/env python3
"""
Test script to verify ExCribbl installation and basic functionality
"""
import sys
import subprocess
import os
import time

def test_installation():
    """Test if all dependencies are installed correctly"""
    print("Testing ExCribbl installation...")
    
    try:
        import fastapi
        import uvicorn
        import requests
        import numpy
        import websockets
        print("✓ All dependencies installed successfully")
        return True
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        return False

def test_basic_imports():
    """Test if main modules can be imported"""
    print("Testing module imports...")
    
    try:
        # Test if we can import the main modules
        import distro
        import main
        print("✓ Main modules imported successfully")
        return True
    except Exception as e:
        print(f"✗ Error importing modules: {e}")
        return False

def main():
    """Run all tests"""
    print("ExCribbl Installation Test")
    print("=" * 30)
    
    success = True
    
    # Test installation
    if not test_installation():
        success = False
    
    # Test imports
    if not test_basic_imports():
        success = False
    
    if success:
        print("\n✓ All tests passed! ExCribbl is ready to run.")
        print("To start the application, run: python distro.py")
    else:
        print("\n✗ Some tests failed. Please check the installation.")
        sys.exit(1)

if __name__ == "__main__":
    main()