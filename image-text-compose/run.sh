#!/bin/bash

# Image Text Composer Docker Runner
# Usage: ./run.sh [dev|prod|stop|clean]

set -e

PROJECT_NAME="image-text-compose"

show_help() {
    echo "Image Text Composer Docker Runner"
    echo ""
    echo "Usage: ./run.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev     Start development environment with hot reload"
    echo "  prod    Start production environment with Nginx"
    echo "  stop    Stop all running containers"
    echo "  clean   Stop containers and clean up images"
    echo "  logs    Show logs from running containers"
    echo "  help    Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./run.sh dev          # Start development server"
    echo "  ./run.sh prod         # Start production server"
    echo "  ./run.sh logs         # View logs"
    echo "  ./run.sh stop         # Stop all containers"
}

start_dev() {
    echo "Starting Image Text Composer in DEVELOPMENT mode..."
    echo "App will be available at: http://localhost:3000"
    echo "Hot reload enabled - changes will reflect automatically"
    echo ""
    docker-compose -f docker-compose.dev.yml up --build
}

start_prod() {
    echo "Starting Image Text Composer in PRODUCTION mode..."
    echo "App will be available at: http://localhost (port 80)"
    echo "Nginx reverse proxy with security headers enabled"
    echo ""
    docker-compose -f docker-compose.prod.yml up -d --build
    echo ""
    echo "Production environment started successfully!"
    echo "View logs: ./run.sh logs"
    echo "Stop: ./run.sh stop"
}

stop_all() {
    echo "Stopping all Image Text Composer containers..."
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    echo "All containers stopped"
}

show_logs() {
    echo "Showing logs from running containers..."
    echo "Press Ctrl+C to exit log view"
    echo ""
    
    # Check which environment is running
    if docker-compose -f docker-compose.dev.yml ps -q | grep -q .; then
        echo "Development logs:"
        docker-compose -f docker-compose.dev.yml logs -f --tail=50
    elif docker-compose -f docker-compose.prod.yml ps -q | grep -q .; then
        echo "Production logs:"
        docker-compose -f docker-compose.prod.yml logs -f --tail=50
    else
        echo "No containers are currently running"
        echo "Start with: ./run.sh dev or ./run.sh prod"
    fi
}

clean_up() {
    echo "Cleaning up Image Text Composer Docker resources..."
    
    # Stop all containers
    stop_all
    
    # Remove images
    echo "Removing Docker images..."
    docker rmi ${PROJECT_NAME}-app-dev 2>/dev/null || true
    docker rmi ${PROJECT_NAME}-app-prod 2>/dev/null || true
    
    # Clean up unused resources
    echo "Cleaning up unused Docker resources..."
    docker system prune -f
    
    echo "Cleanup completed"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Handle commands
case "${1:-help}" in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "stop")
        stop_all
        ;;
    "logs")
        show_logs
        ;;
    "clean")
        clean_up
        ;;
    "help"|*)
        show_help
        ;;
esac
