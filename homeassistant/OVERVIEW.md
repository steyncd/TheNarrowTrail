# Home Assistant Integration - Overview

This folder contains all Home Assistant related files for the Hiking Portal integration.

## Quick Structure

```
homeassistant/
├── custom_components/
│   └── hiking_portal/          # Main integration (v2.5.0)
├── docker-compose.yml          # HA-only Docker setup
├── ha-config/                  # Home Assistant configuration
├── hacs.json                   # HACS repository config
└── README.md                   # Detailed integration docs
```

## Current Status

✅ **Integration Complete**: 24 sensors, WebSocket support, custom icons
✅ **HACS Ready**: Private repository configured
✅ **Docker Ready**: HA-only development environment available

## Quick Start

### Home Assistant Only
```bash
cd homeassistant
docker-compose up -d
```
Access at: http://localhost:8123

### Full Development Stack  
```bash
cd ../docker
./start-dev.bat  # All services including HA
```

## Key Features

- **24 Analytics Sensors**: User growth, hike stats, engagement metrics
- **WebSocket Integration**: Real-time updates
- **Custom Icons**: Professional hiking-themed SVG icons
- **Domain**: `hiking_portal_v2` (cache bypass solution)

See `README.md` for complete documentation, sensor details, and troubleshooting.