class HikingPortalCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      const card = document.createElement('ha-card');
      card.header = 'Hiking Portal';
      this.content = document.createElement('div');
      this.content.style.padding = '16px';
      card.appendChild(this.content);
      this.appendChild(card);
    }

    const entityId = this.config.entity;
    const state = hass.states[entityId];

    if (!state) {
      this.content.innerHTML = `
        <div>Entity ${entityId} not found</div>
      `;
      return;
    }

    const nextHike = state.attributes;

    this.content.innerHTML = `
      <style>
        .hike-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .hike-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .hike-icon {
          font-size: 48px;
        }
        .hike-title {
          font-size: 24px;
          font-weight: bold;
        }
        .hike-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .detail-icon {
          font-size: 20px;
          color: var(--primary-color);
        }
        .hike-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .action-button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background-color: var(--primary-color);
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
        }
        .action-button:hover {
          opacity: 0.9;
        }
        .action-button.secondary {
          background-color: var(--secondary-background-color);
          color: var(--primary-text-color);
        }
      </style>

      <div class="hike-card">
        <div class="hike-header">
          <div class="hike-icon">🥾</div>
          <div>
            <div class="hike-title">${state.state}</div>
            <div style="color: var(--secondary-text-color);">Next Hike</div>
          </div>
        </div>

        ${nextHike.date ? `
          <div class="hike-details">
            <div class="detail-item">
              <span class="detail-icon">📅</span>
              <span>${new Date(nextHike.date).toLocaleDateString()}</span>
            </div>
            ${nextHike.location ? `
              <div class="detail-item">
                <span class="detail-icon">📍</span>
                <span>${nextHike.location}</span>
              </div>
            ` : ''}
            ${nextHike.difficulty ? `
              <div class="detail-item">
                <span class="detail-icon">⚡</span>
                <span>${nextHike.difficulty}</span>
              </div>
            ` : ''}
            ${nextHike.distance ? `
              <div class="detail-item">
                <span class="detail-icon">🚶</span>
                <span>${nextHike.distance} km</span>
              </div>
            ` : ''}
            ${nextHike.duration ? `
              <div class="detail-item">
                <span class="detail-icon">⏱️</span>
                <span>${nextHike.duration} hours</span>
              </div>
            ` : ''}
            ${nextHike.price ? `
              <div class="detail-item">
                <span class="detail-icon">💰</span>
                <span>R${nextHike.price}</span>
              </div>
            ` : ''}
            ${nextHike.interested_count ? `
              <div class="detail-item">
                <span class="detail-icon">👥</span>
                <span>${nextHike.interested_count} interested</span>
              </div>
            ` : ''}
          </div>

          <div class="hike-actions">
            <button class="action-button" onclick="this.handleExpressInterest(${nextHike.hike_id})">
              Join Hike
            </button>
            <button class="action-button secondary" onclick="window.open('https://helloliam.web.app/hikes/${nextHike.hike_id}', '_blank')">
              View Details
            </button>
          </div>
        ` : '<div>No upcoming hikes</div>'}
      </div>
    `;
  }

  handleExpressInterest(hikeId) {
    this._hass.callService('hiking_portal', 'express_interest', {
      hike_id: hikeId
    });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('hiking-portal-card', HikingPortalCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'hiking-portal-card',
  name: 'Hiking Portal Card',
  description: 'A custom card for displaying hiking portal information',
  preview: true,
});
