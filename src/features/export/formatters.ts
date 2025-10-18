import { ExportData } from './exporter';
import { format } from 'date-fns';

/**
 * Generate HTML export with styled tables for all data
 */
export function generateHTMLExport(data: ExportData): string {
  const exportDate = format(new Date(data.exported_at), 'dd/MM/yyyy HH:mm');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PetLinkID Data Export - ${exportDate}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #f9fafb;
      padding: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    header {
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    
    h1 {
      color: #1e40af;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .export-info {
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    .section {
      margin-bottom: 3rem;
    }
    
    h2 {
      color: #1f2937;
      font-size: 1.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .empty-state {
      padding: 2rem;
      text-align: center;
      color: #9ca3af;
      background: #f9fafb;
      border-radius: 4px;
      font-style: italic;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      font-size: 0.875rem;
    }
    
    th {
      background: #f3f4f6;
      padding: 0.75rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border: 1px solid #e5e7eb;
    }
    
    td {
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      vertical-align: top;
    }
    
    tr:nth-child(even) {
      background: #f9fafb;
    }
    
    .profile-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }
    
    .profile-item {
      display: flex;
      flex-direction: column;
    }
    
    .profile-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 0.75rem;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }
    
    .profile-value {
      color: #1f2937;
    }
    
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }
    
    .badge-warning {
      background: #fef3c7;
      color: #92400e;
    }
    
    .badge-info {
      background: #dbeafe;
      color: #1e40af;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
      }
      
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🐾 PetLinkID Data Export</h1>
      <div class="export-info">
        Exported on ${exportDate}
      </div>
    </header>

    ${formatProfileSection(data.profile)}
    ${formatPetsSection(data.pets)}
    ${formatVaccinationsSection(data.vaccinations)}
    ${formatHealthRemindersSection(data.health_reminders)}
    ${formatDocumentsSection(data.pet_documents)}
    ${formatMembershipsSection(data.memberships)}
    ${data.pet_invites && data.pet_invites.length > 0 ? formatInvitesSection(data.pet_invites) : ''}
    ${formatNotificationsSection(data.notifications)}
  </div>
</body>
</html>
  `.trim();
}

function formatProfileSection(profile: any): string {
  if (!profile || Object.keys(profile).length === 0) {
    return `
    <section class="section">
      <h2>Profile</h2>
      <div class="empty-state">No profile data available</div>
    </section>
    `;
  }

  return `
    <section class="section">
      <h2>Profile</h2>
      <div class="profile-grid">
        ${profile.display_name ? `
          <div class="profile-item">
            <div class="profile-label">Display Name</div>
            <div class="profile-value">${escapeHtml(profile.display_name)}</div>
          </div>
        ` : ''}
        ${profile.email ? `
          <div class="profile-item">
            <div class="profile-label">Email</div>
            <div class="profile-value">${escapeHtml(profile.email)}</div>
          </div>
        ` : ''}
        ${profile.phone ? `
          <div class="profile-item">
            <div class="profile-label">Phone</div>
            <div class="profile-value">${escapeHtml(profile.phone)}</div>
          </div>
        ` : ''}
        ${profile.plan_tier ? `
          <div class="profile-item">
            <div class="profile-label">Plan</div>
            <div class="profile-value">
              <span class="badge badge-info">${escapeHtml(profile.plan_tier)}</span>
            </div>
          </div>
        ` : ''}
        <div class="profile-item">
          <div class="profile-label">Member Since</div>
          <div class="profile-value">${formatDate(profile.created_at)}</div>
        </div>
      </div>
    </section>
  `;
}

function formatPetsSection(pets: any[]): string {
  if (!pets || pets.length === 0) {
    return `
    <section class="section">
      <h2>Pets (0)</h2>
      <div class="empty-state">No pets registered</div>
    </section>
    `;
  }

  return `
    <section class="section">
      <h2>Pets (${pets.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Species</th>
            <th>Breed</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Microchip</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${pets.map(pet => `
            <tr>
              <td>
                ${pet.photo_url 
                  ? `<img src="${escapeHtml(pet.photo_url)}" alt="${escapeHtml(pet.name)}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">` 
                  : '<div style="width: 60px; height: 60px; background: #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🐾</div>'
                }
              </td>
              <td><strong>${escapeHtml(pet.name)}</strong></td>
              <td>${escapeHtml(pet.species || '-')}</td>
              <td>${escapeHtml(pet.breed || '-')}</td>
              <td>${formatAge(pet.age_years, pet.age_months)}</td>
              <td>${escapeHtml(pet.gender || '-')}</td>
              <td>${escapeHtml(pet.microchip_number || '-')}</td>
              <td>
                ${pet.is_lost 
                  ? '<span class="badge badge-warning">Lost</span>' 
                  : '<span class="badge badge-success">Safe</span>'
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function formatVaccinationsSection(vaccinations: any[]): string {
  if (!vaccinations || vaccinations.length === 0) {
    return `
    <section class="section">
      <h2>Vaccinations (0)</h2>
      <div class="empty-state">No vaccination records</div>
    </section>
    `;
  }

  return `
    <section class="section">
      <h2>Vaccinations (${vaccinations.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Vaccine Name</th>
            <th>Date Given</th>
            <th>Next Due</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${vaccinations.map(vacc => `
            <tr>
              <td><strong>${escapeHtml(vacc.vaccine_name)}</strong></td>
              <td>${formatDate(vacc.vaccine_date)}</td>
              <td>${vacc.next_due_date ? formatDate(vacc.next_due_date) : '-'}</td>
              <td>${escapeHtml(vacc.notes || '-')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function formatHealthRemindersSection(reminders: any[]): string {
  if (!reminders || reminders.length === 0) {
    return `
    <section class="section">
      <h2>Health Reminders (0)</h2>
      <div class="empty-state">No health reminders</div>
    </section>
    `;
  }

  return `
    <section class="section">
      <h2>Health Reminders (${reminders.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${reminders.map(reminder => `
            <tr>
              <td><strong>${escapeHtml(reminder.title)}</strong></td>
              <td>${escapeHtml(reminder.reminder_type || '-')}</td>
              <td>${formatDate(reminder.reminder_date)}</td>
              <td>
                ${reminder.completed 
                  ? '<span class="badge badge-success">Completed</span>' 
                  : '<span class="badge badge-warning">Pending</span>'
                }
              </td>
              <td>${escapeHtml(reminder.description || '-')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function formatDocumentsSection(documents: any[]): string {
  if (!documents || documents.length === 0) {
    return `
    <section class="section">
      <h2>Documents (0)</h2>
      <div class="empty-state">No documents uploaded</div>
    </section>
    `;
  }

  const totalSize = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);

  return `
    <section class="section">
      <h2>Documents (${documents.length})</h2>
      <p style="color: #6b7280; margin-bottom: 1rem;">
        Total: ${documents.length} files (${formatFileSize(totalSize)})
        <br/>
        <em>All documents are included in the "documents" folder of this download.</em>
      </p>
      <table>
        <thead>
          <tr>
            <th>File Name</th>
            <th>Type</th>
            <th>Size</th>
            <th>Uploaded</th>
          </tr>
        </thead>
        <tbody>
          ${documents.map(doc => `
            <tr>
              <td><strong>${escapeHtml(doc.file_name)}</strong></td>
              <td>${escapeHtml(doc.file_type || '-')}</td>
              <td>${formatFileSize(doc.file_size)}</td>
              <td>${formatDate(doc.created_at)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function formatMembershipsSection(memberships: any[]): string {
  if (!memberships || memberships.length === 0) {
    return `
    <section class="section">
      <h2>Shared Access (0)</h2>
      <div class="empty-state">No shared access memberships</div>
    </section>
    `;
  }

  return `
    <section class="section">
      <h2>Shared Access (${memberships.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          ${memberships.map(membership => `
            <tr>
              <td>
                <span class="badge badge-info">${escapeHtml(membership.role)}</span>
              </td>
              <td>${formatDate(membership.created_at)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function formatInvitesSection(invites: any[]): string {
  if (!invites || invites.length === 0) return '';

  return `
    <section class="section">
      <h2>Invitations (${invites.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Expires</th>
          </tr>
        </thead>
        <tbody>
          ${invites.map(invite => `
            <tr>
              <td>${escapeHtml(invite.email)}</td>
              <td>
                <span class="badge badge-info">${escapeHtml(invite.role)}</span>
              </td>
              <td>
                ${invite.status === 'accepted' 
                  ? '<span class="badge badge-success">Accepted</span>' 
                  : invite.status === 'pending'
                  ? '<span class="badge badge-warning">Pending</span>'
                  : '<span class="badge">Cancelled</span>'
                }
              </td>
              <td>${formatDate(invite.created_at)}</td>
              <td>${formatDate(invite.expires_at)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function formatNotificationsSection(notifications: any[]): string {
  if (!notifications || notifications.length === 0) {
    return `
    <section class="section">
      <h2>Notifications (0)</h2>
      <div class="empty-state">No notifications</div>
    </section>
    `;
  }

  return `
    <section class="section">
      <h2>Notifications (${notifications.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Message</th>
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${notifications.map(notif => `
            <tr>
              <td><strong>${escapeHtml(notif.title)}</strong></td>
              <td>${escapeHtml(notif.message)}</td>
              <td>
                <span class="badge badge-info">${escapeHtml(notif.type || 'info')}</span>
              </td>
              <td>${formatDate(notif.created_at)}</td>
              <td>
                ${notif.read 
                  ? '<span class="badge badge-success">Read</span>' 
                  : '<span class="badge badge-warning">Unread</span>'
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

// Utility functions
function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd/MM/yyyy');
  } catch {
    return String(date);
  }
}

function formatAge(years: number | null | undefined, months: number | null | undefined): string {
  const parts = [];
  if (years !== null && years !== undefined) parts.push(`${years}y`);
  if (months !== null && months !== undefined && months > 0) parts.push(`${months}m`);
  return parts.length > 0 ? parts.join(' ') : '-';
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '-';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}
