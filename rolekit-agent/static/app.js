/**
 * Modern Resume Builder - Frontend Application
 * Inspired by Resume.io with professional features and AI integration
 */

// ============================================================================
// APP STATE MANAGEMENT
// ============================================================================

class ResumeBuilderApp {
  constructor() {
    this.state = {
      currentPage: 'dashboard',
      currentResume: null,
      resumes: [],
      templates: [],
      user: null,
      selectedTemplate: 'modern',
      resumeData: {
        contact: {
          fullName: '',
          email: '',
          phone: '',
          location: '',
          website: '',
          linkedin: ''
        },
        professional_summary: '',
        experience: [],
        education: [],
        projects: [],
        skills: [],
        certifications: [],
        languages: [],
        future_goals: ''
      },
      chatMessages: [],
      isLoading: false,
      error: null
    };

    this.init();
  }

  init() {
    // Wait for DOM to be ready before rendering
    const appElement = document.getElementById('app');
    if (!appElement) {
      console.error('App element not found in DOM');
      return;
    }
    
    this.renderApp();
    this.setupEventListeners();
    this.loadTemplates();
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.renderApp();
  }

  setupEventListeners() {
    try {
      console.log('📋 Setting up event listeners...');
      
      // Handle click events for buttons and actions
      document.addEventListener('click', (e) => {
        console.log('🖱️ Click detected on:', e.target.tagName, e.target.className, 'data-action:', e.target.dataset?.action);
        
        if (e.target && e.target.matches('[data-action]')) {
          console.log('✅ Matched [data-action]:', e.target.dataset.action);
          this.handleAction(e.target.dataset.action, e.target);
        } else if (e.target && e.target.closest('[data-action]')) {
          // Handle clicks on children of [data-action] elements
          const actionElement = e.target.closest('[data-action]');
          console.log('✅ Found parent with [data-action]:', actionElement.dataset.action);
          this.handleAction(actionElement.dataset.action, actionElement);
        }
      });

      // Handle input/change events for form fields
      document.addEventListener('change', (e) => {
        if (e.target && e.target.dataset.field) {
          console.log('📝 Change event on field:', e.target.dataset.field, 'Value:', e.target.value);
          this.handleFormChange(e.target);
        }
      });

      // Handle input events for real-time updates
      document.addEventListener('input', (e) => {
        if (e.target && e.target.dataset.field) {
          console.log('⌨️ Input event on field:', e.target.dataset.field, 'Value:', e.target.value);
          this.handleFormChange(e.target);
        }
      });

      // Handle Enter key for skill input
      document.addEventListener('keypress', (e) => {
        if (e.target && e.target.id === 'skill-input' && e.key === 'Enter') {
          e.preventDefault();
          this.addSkill();
        }
      });
      
      console.log('✅ Event listeners set up successfully');
    } catch (error) {
      console.error('❌ Error setting up event listeners:', error);
    }
  }

  handleAction(action, element) {
    try {
      const actions = {
        'new-resume': () => this.createNewResume(),
        'edit-resume': (id) => this.editResume(id),
        'delete-resume': (id) => this.deleteResume(id),
        'select-template': (name) => this.selectTemplate(name),
        'upload-file': () => {
          const fileInput = document.getElementById('fileInput');
          if (fileInput) fileInput.click();
        },
        'export-pdf': () => this.exportPdf(),
        'export-docx': () => this.exportDocx(),
        'preview-resume': () => this.togglePreview(),
        'go-back': () => this.goBack(),
        'send-message': () => this.sendChatMessage(),
        'enhance-text': (field) => this.enhanceText(field),
        'ai-generate': () => this.aiGenerate(),
        'add-experience': () => this.addExperience(),
        'remove-experience': (index) => this.removeExperience(parseInt(index)),
        'add-education': () => this.addEducation(),
        'remove-education': (index) => this.removeEducation(parseInt(index)),
        'add-project': () => this.addProject(),
        'remove-project': (index) => this.removeProject(parseInt(index)),
        'add-skill': () => this.addSkill(),
        'remove-skill': (index) => this.removeSkill(parseInt(index)),
        'suggest-skills': () => this.suggestSkills(),
        'generate-future-goals': () => this.generateFutureGoals()
      };

      const handler = actions[action];
      if (handler && typeof handler === 'function') {
        // For enhance-text action, pass data-field instead of data-id
        if (action === 'enhance-text') {
          const field = element?.dataset?.field;
          handler(field);
        } else {
          const dataId = element?.dataset?.id || element?.dataset?.index;
          handler(dataId);
        }
      } else if (!handler) {
        console.warn('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error handling action:', action, error);
    }
  }

  handleFormChange(element) {
    try {
      const fieldPath = element.dataset.field;
      const value = element.value;
      
      console.log(`📊 Updating field: ${fieldPath} = "${value}"`);
      
      if (!fieldPath) {
        console.warn('⚠️ No field path found');
        return;
      }

      // Parse the field path (e.g., "contact.fullName" -> ["contact", "fullName"])
      const parts = fieldPath.split('.');
      
      if (parts.length === 1) {
        // Direct field update
        console.log(`  Setting resumeData[${parts[0]}] = "${value}"`);
        this.state.resumeData[parts[0]] = value;
      } else if (parts.length === 2) {
        // Nested field update (e.g., contact.fullName)
        console.log(`  Setting resumeData[${parts[0]}][${parts[1]}] = "${value}"`);
        if (!this.state.resumeData[parts[0]]) {
          console.log(`  Creating empty object for resumeData[${parts[0]}]`);
          this.state.resumeData[parts[0]] = {};
        }
        this.state.resumeData[parts[0]][parts[1]] = value;
      } else if (parts.length === 3) {
        // Array field update (e.g., experience.0.jobTitle or projects.0.name)
        const arrayName = parts[0];
        const index = parseInt(parts[1]);
        const fieldName = parts[2];
        
        console.log(`  Setting resumeData[${arrayName}][${index}][${fieldName}] = "${value}"`);
        
        // Ensure array exists
        if (!Array.isArray(this.state.resumeData[arrayName])) {
          this.state.resumeData[arrayName] = [];
        }
        
        // Ensure array item exists
        if (!this.state.resumeData[arrayName][index]) {
          this.state.resumeData[arrayName][index] = {};
        }
        
        // Handle special case: technologies field should store as array or string
        if (fieldName === 'technologies') {
          // Store as string in state, but it will be converted to array when rendering
          this.state.resumeData[arrayName][index][fieldName] = value;
          console.log(`  ✅ Technologies field updated (will be split on render)`);
        } else {
          this.state.resumeData[arrayName][index][fieldName] = value;
        }
      }

      console.log(`  ✅ Updated state:`, this.state.resumeData);
      
      // Update both form and live preview
      this.updateLivePreview();
    } catch (error) {
      console.error('Error handling form change:', error);
    }
  }

  updateLivePreview() {
    try {
      const livePreview = document.querySelector('.live-preview');
      if (livePreview) {
        const previewWrapper = livePreview.querySelector('.resume-preview-content-wrapper');
        if (previewWrapper) {
          previewWrapper.innerHTML = this.renderLivePreview();
        }
      }
    } catch (error) {
      console.error('Error updating live preview:', error);
    }
  }

  renderApp() {
    const app = document.getElementById('app');
    if (!app) {
      console.error('App element not found');
      return;
    }
    
    if (this.state.currentPage === 'dashboard') {
      app.innerHTML = this.renderDashboard();
    } else if (this.state.currentPage === 'editor') {
      app.innerHTML = this.renderEditor();
    } else if (this.state.currentPage === 'templates') {
      app.innerHTML = this.renderTemplates();
    }
  }

  // ========================================================================
  // DASHBOARD VIEW
  // ========================================================================

  renderDashboard() {
    return `
      <div class="dashboard">
        <nav class="navbar">
          <div class="navbar-brand">
            <h1>Resume.Build</h1>
            <span class="subtitle">Get Hired Faster</span>
          </div>
          <div class="navbar-menu">
            <a href="#" class="nav-link">Templates</a>
            <a href="#" class="nav-link">Examples</a>
            <a href="#" class="nav-link">Resources</a>
            <button class="btn btn-primary">Sign In</button>
          </div>
        </nav>

        <section class="hero-section">
          <div class="hero-content">
            <h2>Stand Out to Recruiters</h2>
            <p>Only 2% of resumes win. Yours will be one of them.</p>
            <button class="btn btn-lg btn-gradient" data-action="new-resume">
              Create My Resume
            </button>
            <div class="hero-stats">
              <div class="stat">
                <strong>39%</strong>
                <span>more likely to land the job</span>
              </div>
              <div class="stat">
                <strong>4.3/5</strong>
                <span>55,245 reviews</span>
              </div>
              <div class="stat">
                <strong>7%</strong>
                <span>higher salary</span>
              </div>
            </div>
          </div>
          <div class="hero-image">
            <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
              <rect x="50" y="30" width="300" height="240" fill="none" stroke="#007AFF" stroke-width="2" rx="8"/>
              <line x1="50" y1="70" x2="350" y2="70" stroke="#007AFF" stroke-width="1"/>
              <line x1="50" y1="100" x2="350" y2="100" stroke="#E8E8E8" stroke-width="1"/>
              <line x1="50" y1="130" x2="350" y2="130" stroke="#E8E8E8" stroke-width="1"/>
              <line x1="50" y1="160" x2="350" y2="160" stroke="#E8E8E8" stroke-width="1"/>
              <line x1="50" y1="190" x2="350" y2="190" stroke="#E8E8E8" stroke-width="1"/>
              <line x1="50" y1="220" x2="350" y2="220" stroke="#E8E8E8" stroke-width="1"/>
              <circle cx="70" cy="50" r="8" fill="#007AFF"/>
            </svg>
          </div>
        </section>

        <section class="features-section">
          <h3>Why Resume.Build?</h3>
          <div class="features-grid">
            ${this.renderFeatures()}
          </div>
        </section>

        <section class="templates-preview">
          <h3>Choose From Professional Templates</h3>
          <div class="templates-carousel">
            ${this.renderTemplateCarousel()}
          </div>
        </section>

        <section class="my-resumes">
          <div class="section-header">
            <h3>My Resumes</h3>
            <button class="btn btn-primary btn-sm" data-action="new-resume">
              + New Resume
            </button>
          </div>
          <div class="resumes-grid">
            ${this.state.resumes.length > 0 
              ? this.state.resumes.map(r => this.renderResumeCard(r)).join('')
              : this.renderEmptyState()
            }
          </div>
        </section>

        <footer class="footer">
          <p>&copy; 2025 Resume.Build - Get Hired Faster | Made with AI</p>
        </footer>
      </div>
    `;
  }

  renderFeatures() {
    const features = [
      {
        icon: '⚡',
        title: 'AI-Powered',
        desc: 'Let AI write for you. Get professional content in seconds.'
      },
      {
        icon: '✓',
        title: 'ATS-Optimized',
        desc: '100% compliant templates. Recruiters will see your resume.'
      },
      {
        icon: '🎨',
        title: 'Beautiful Design',
        desc: '50+ professionally designed templates to choose from.'
      },
      {
        icon: '📱',
        title: 'Real-time Preview',
        desc: 'See your changes instantly as you build your resume.'
      },
      {
        icon: '⬇️',
        title: 'Multi-Format Export',
        desc: 'Download as PDF, Word, or HTML - perfectly formatted.'
      },
      {
        icon: '🔐',
        title: 'Safe & Secure',
        desc: 'Your data is encrypted and protected with enterprise security.'
      }
    ];

    return features.map(f => `
      <div class="feature-card">
        <div class="feature-icon">${f.icon}</div>
        <h4>${f.title}</h4>
        <p>${f.desc}</p>
      </div>
    `).join('');
  }

  renderTemplateCarousel() {
    const templates = [
      { id: 'modern', name: 'Modern', color: '#007AFF', description: 'Clean and professional' },
      { id: 'classic', name: 'Classic', color: '#333333', description: 'Traditional & timeless' },
      { id: 'creative', name: 'Creative', color: '#FF6B6B', description: 'Stand out & impress' },
      { id: 'minimal', name: 'Minimal', color: '#666666', description: 'Simple & elegant' },
      { id: 'bold', name: 'Bold', color: '#FF9500', description: 'Confident & modern' },
      { id: 'elegant', name: 'Elegant', color: '#9C27B0', description: 'Sophisticated & refined' }
    ];

    return templates.map(t => `
      <button 
        class="template-button ${this.state.selectedTemplate === t.id ? 'selected' : ''}" 
        data-action="select-template" 
        data-id="${t.id}"
        style="border-color: ${t.color}"
      >
        <div class="template-button-header" style="background: linear-gradient(135deg, ${t.color}, ${this.lightenColor(t.color)})">
          <div class="template-icon">🎨</div>
        </div>
        <div class="template-button-content">
          <h4>${t.name}</h4>
          <p>${t.description}</p>
        </div>
        <div class="template-button-footer">
          ${this.state.selectedTemplate === t.id ? '<span class="selected-badge">✓ Selected</span>' : '<span class="select-badge">Choose</span>'}
        </div>
      </button>
    `).join('');
  }

  renderResumeCard(resume) {
    return `
      <div class="resume-card">
        <div class="resume-preview">
          <div class="resume-thumbnail">
            <div class="resume-header">${resume.title}</div>
            <div class="resume-lines">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
        <div class="resume-info">
          <h4>${resume.title}</h4>
          <p class="last-edited">Last edited: ${this.formatDate(resume.updated_at)}</p>
          <div class="resume-actions">
            <button class="btn btn-sm btn-primary" data-action="edit-resume" data-id="${resume.id}">
              Edit
            </button>
            <button class="btn btn-sm btn-secondary" data-action="delete-resume" data-id="${resume.id}">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <h4>No Resumes Yet</h4>
        <p>Create your first resume to get started</p>
        <button class="btn btn-primary" data-action="new-resume">
          Create Resume
        </button>
      </div>
    `;
  }

  // ========================================================================
  // TEMPLATES VIEW
  // ========================================================================

  renderTemplates() {
    return `
      <div class="templates-page">
        ${this.renderPageHeader('Resume Templates')}
        
        <div class="templates-container">
          <div class="templates-sidebar">
            <h4>Filter by Category</h4>
            <label><input type="checkbox"> ATS Optimized</label>
            <label><input type="checkbox"> Modern</label>
            <label><input type="checkbox"> Creative</label>
            <label><input type="checkbox"> Simple</label>
          </div>

          <div class="templates-main">
            <div class="templates-grid">
              ${this.renderTemplateCards()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderTemplateCards() {
    const templates = [
      { id: 'modern', name: 'Modern', category: 'Professional', ats: true },
      { id: 'classic', name: 'Classic', category: 'Traditional', ats: true },
      { id: 'creative', name: 'Creative', category: 'Creative', ats: false },
      { id: 'minimal', name: 'Minimal', category: 'Simple', ats: true },
      { id: 'bold', name: 'Bold', category: 'Modern', ats: false },
      { id: 'elegant', name: 'Elegant', category: 'Professional', ats: true }
    ];

    return templates.map(t => `
      <div class="template-card">
        <div class="template-preview-large">
          <div class="template-image" style="background: linear-gradient(135deg, #007AFF, #5856D6)"></div>
        </div>
        <div class="template-details">
          <h5>${t.name}</h5>
          <p>${t.category}</p>
          ${t.ats ? '<span class="badge badge-ats">ATS Optimized</span>' : ''}
          <button class="btn btn-primary btn-block mt-2" data-action="select-template" data-id="${t.id}">
            Use This Template
          </button>
        </div>
      </div>
    `).join('');
  }

  // ========================================================================
  // EDITOR VIEW
  // ========================================================================

  renderEditor() {
    return `
      <div class="editor-wrapper">
        <div class="editor-header">
          <button class="btn btn-secondary btn-sm" data-action="go-back">← Back</button>
          <h2>${this.state.currentResume?.title || 'New Resume'}</h2>
          <div class="editor-actions">
            <button class="btn btn-secondary btn-sm" data-action="preview-resume">Preview</button>
            <button class="btn btn-primary btn-sm" data-action="export-pdf">Export PDF</button>
            <button class="btn btn-primary btn-sm" data-action="export-docx">Export DOCX</button>
          </div>
        </div>

        <div class="editor-container">
          <div class="editor-left">
            ${this.renderEditorForm()}
          </div>
          <div class="editor-right">
            <div class="live-preview">
              <div class="preview-header">
                <h5>Live Preview</h5>
                <button class="btn-icon" data-action="preview-resume">↗️</button>
              </div>
              <div class="resume-preview-content-wrapper">
                ${this.renderLivePreview()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderEditorForm() {
    return `
      <div class="editor-form">
        <div class="form-section">
          <div class="section-header">
            <h4>Contact Information</h4>
          </div>
          ${this.renderContactForm()}
        </div>

        <div class="form-section">
          <div class="section-header">
            <h4>Professional Summary</h4>
            <button class="btn-icon" data-action="enhance-text" data-field="professional_summary">✨</button>
          </div>
          <textarea 
            placeholder="Brief overview of your professional background and goals..." 
            class="form-control"
            data-field="professional_summary"
            rows="4"
          >${this.state.resumeData.professional_summary || ''}</textarea>
        </div>

        <div class="form-section">
          <div class="section-header">
            <h4>Experience</h4>
            <button class="btn-sm btn-primary" data-action="add-experience">+ Add</button>
          </div>
          ${this.renderExperienceForm()}
        </div>

        <div class="form-section">
          <div class="section-header">
            <h4>Education</h4>
            <button class="btn-sm btn-primary" data-action="add-education">+ Add</button>
          </div>
          ${this.renderEducationForm()}
        </div>

        <div class="form-section">
          <div class="section-header">
            <h4>Projects</h4>
            <button class="btn-sm btn-primary" data-action="add-project">+ Add</button>
          </div>
          ${this.renderProjectsForm()}
        </div>

        <div class="form-section">
          <div class="section-header">
            <h4>Skills</h4>
            <div style="display: flex; gap: 8px;">
              <button class="btn-sm btn-primary" data-action="suggest-skills" title="Suggest skills based on experience, projects, and technologies">💡 Suggest</button>
              <button class="btn-sm btn-primary" data-action="add-skill">+ Add</button>
            </div>
          </div>
          ${this.renderSkillsForm()}
        </div>

        <div class="form-section">
          <div class="section-header">
            <h4>Future Goals</h4>
            <button class="btn-icon" data-action="generate-future-goals" title="Generate with AI">✨</button>
          </div>
          <textarea 
            placeholder="Your professional aspirations and career goals for the next 3-5 years..." 
            class="form-control"
            data-field="future_goals"
            rows="4"
          >${this.state.resumeData.future_goals || ''}</textarea>
        </div>
      </div>
    `;
  }

  renderContactForm() {
    const contact = this.state.resumeData.contact;
    return `
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" class="form-control" data-field="contact.fullName" value="${contact.fullName || ''}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Email</label>
          <input type="email" class="form-control" data-field="contact.email" value="${contact.email || ''}">
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" class="form-control" data-field="contact.phone" value="${contact.phone || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Location</label>
          <input type="text" class="form-control" data-field="contact.location" value="${contact.location || ''}">
        </div>
        <div class="form-group">
          <label>Website</label>
          <input type="url" class="form-control" data-field="contact.website" value="${contact.website || ''}">
        </div>
      </div>
      <div class="form-group">
        <label>LinkedIn URL</label>
        <input type="url" class="form-control" data-field="contact.linkedin" value="${contact.linkedin || ''}">
      </div>
    `;
  }

  renderExperienceForm() {
    if (this.state.resumeData.experience.length === 0) {
      return '<p class="empty-section">Add your work experience...</p>';
    }

    return this.state.resumeData.experience.map((exp, i) => `
      <div class="form-subsection">
        <div class="form-group">
          <label>Company</label>
          <input type="text" class="form-control" data-field="experience.${i}.company" value="${exp.company || ''}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Job Title</label>
            <div class="field-with-action">
              <input type="text" class="form-control" data-field="experience.${i}.job_title" value="${exp.job_title || ''}">
              <button class="btn-icon" data-action="enhance-text" data-field="experience.${i}.job_title" title="Validate & correct job title">✨</button>
            </div>
          </div>
          <div class="form-group">
            <label>Duration</label>
            <input type="text" class="form-control" placeholder="e.g., Jan 2020 - Present" data-field="experience.${i}.duration" value="${exp.duration || ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <div class="field-with-action">
            <textarea class="form-control" rows="3" data-field="experience.${i}.description">${exp.description || ''}</textarea>
            <button class="btn-icon" data-action="enhance-text" data-field="experience.${i}.description" title="Enhance with AI">✨</button>
          </div>
        </div>
        <button class="btn-sm btn-danger" data-action="remove-experience" data-index="${i}">Remove</button>
      </div>
    `).join('');
  }

  renderEducationForm() {
    if (this.state.resumeData.education.length === 0) {
      return '<p class="empty-section">Add your education...</p>';
    }

    return this.state.resumeData.education.map((edu, i) => `
      <div class="form-subsection">
        <div class="form-row">
          <div class="form-group">
            <label>School/University</label>
            <input type="text" class="form-control" data-field="education.${i}.school" value="${edu.school || ''}">
          </div>
          <div class="form-group">
            <label>Graduation Year</label>
            <input type="text" class="form-control" data-field="education.${i}.year" value="${edu.year || ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Degree</label>
          <div class="field-with-action">
            <input type="text" class="form-control" data-field="education.${i}.degree" value="${edu.degree || ''}">
            <button class="btn-icon" data-action="enhance-text" data-field="education.${i}.degree" title="Validate & enhance degree">✨</button>
          </div>
        </div>
        <button class="btn-sm btn-danger" data-action="remove-education" data-index="${i}">Remove</button>
      </div>
    `).join('');
  }

  renderProjectsForm() {
    if (this.state.resumeData.projects.length === 0) {
      return '<p class="empty-section">Add your projects...</p>';
    }

    return this.state.resumeData.projects.map((proj, i) => `
      <div class="form-subsection">
        <div class="form-group">
          <label>Project Name</label>
          <input type="text" class="form-control" data-field="projects.${i}.name" value="${proj.name || ''}">
        </div>
        <div class="form-group">
          <label>Description</label>
          <div class="field-with-action">
            <textarea class="form-control" data-field="projects.${i}.description" placeholder="Describe what you did and the results...">${proj.description || ''}</textarea>
            <button class="btn-icon" data-action="enhance-text" data-field="projects.${i}.description" title="Enhance with AI">✨</button>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Project URL (optional)</label>
            <input type="text" class="form-control" data-field="projects.${i}.url" placeholder="https://..." value="${proj.url || ''}">
          </div>
          <div class="form-group">
            <label>Repository (optional)</label>
            <input type="text" class="form-control" data-field="projects.${i}.repository" placeholder="https://github.com/..." value="${proj.repository || ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Technologies Used (comma-separated)</label>
          <div class="field-with-action">
            <input type="text" class="form-control" data-field="projects.${i}.technologies" placeholder="React, Node.js, MongoDB" value="${Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '')}">
            <button class="btn-icon" data-action="enhance-text" data-field="projects.${i}.technologies" title="Enhance technologies">✨</button>
          </div>
        </div>
        <button class="btn-sm btn-danger" data-action="remove-project" data-index="${i}">Remove</button>
      </div>
    `).join('');
  }

  renderSkillsForm() {
    return `
      <div class="skills-input">
        <input type="text" class="form-control" placeholder="Add a skill and press Enter" id="skill-input">
      </div>
      <div class="skills-list">
        ${this.state.resumeData.skills.map((skill, i) => `
          <span class="skill-tag">
            ${skill}
            <button class="btn-close" data-action="remove-skill" data-index="${i}">×</button>
          </span>
        `).join('')}
      </div>
    `;
  }

  renderLivePreview() {
    const contact = this.state.resumeData.contact;
    const template = this.state.currentResume?.template || this.state.selectedTemplate;
    
    return `
      <div class="resume-preview-content resume-template-${template}">
        <div class="preview-header-section">
          <h3>${contact.fullName || 'Your Name'}</h3>
          <p class="preview-subtitle">
            ${contact.email || 'email@example.com'} • 
            ${contact.phone || 'Phone'} • 
            ${contact.location || 'Location'}
          </p>
        </div>

        ${this.state.resumeData.professional_summary ? `
          <div class="preview-section">
            <h4>Professional Summary</h4>
            <p>${this.state.resumeData.professional_summary}</p>
          </div>
        ` : ''}

        ${this.state.resumeData.experience.length > 0 ? `
          <div class="preview-section">
            <h4>Experience</h4>
            ${this.state.resumeData.experience.map(exp => `
              <div class="preview-item">
                <div class="item-header">
                  <strong>${exp.job_title || 'Job Title'}</strong>
                  <span>${exp.duration || ''}</span>
                </div>
                <p class="item-company">${exp.company || 'Company'}</p>
                <p class="item-desc">${exp.description || ''}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${this.state.resumeData.education.length > 0 ? `
          <div class="preview-section">
            <h4>Education</h4>
            ${this.state.resumeData.education.map(edu => `
              <div class="preview-item">
                <div class="item-header">
                  <strong>${edu.degree || 'Degree'}</strong>
                  <span>${edu.year || ''}</span>
                </div>
                <p class="item-company">${edu.school || 'School/University'}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${this.state.resumeData.projects.length > 0 ? `
          <div class="preview-section">
            <h4>Projects</h4>
            ${this.state.resumeData.projects.map(proj => {
              // Handle technologies: can be string or array
              let techArray = [];
              if (proj.technologies) {
                if (typeof proj.technologies === 'string') {
                  techArray = proj.technologies.split(',').map(t => t.trim()).filter(t => t);
                } else if (Array.isArray(proj.technologies)) {
                  techArray = proj.technologies;
                }
              }
              
              return `
              <div class="preview-item">
                <div class="item-header">
                  <strong>${proj.name || 'Project'}</strong>
                </div>
                <p class="item-description">${proj.description || 'Project description'}</p>
                ${techArray.length > 0 ? `
                  <div class="item-tech">
                    ${techArray.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            `;
            }).join('')}
          </div>
        ` : ''}

        ${Array.isArray(this.state.resumeData.skills) && this.state.resumeData.skills.length > 0 ? `
          <div class="preview-section">
            <h4>Skills</h4>
            <div class="skills-preview">
              ${this.state.resumeData.skills.map(s => `<span class="skill-badge">${s}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${this.state.resumeData.future_goals ? `
          <div class="preview-section">
            <h4>Future Goals</h4>
            <p>${this.state.resumeData.future_goals}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  renderPageHeader(title) {
    return `
      <div class="page-header">
        <button class="btn btn-secondary btn-sm" data-action="go-back">← Back</button>
        <h2>${title}</h2>
      </div>
    `;
  }

  formatDate(date) {
    if (!date) return 'Recently';
    return new Date(date).toLocaleDateString();
  }

  lightenColor(color) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + 50);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + 50);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + 50);
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
  }

  createNewResume() {
    this.state.currentResume = {
      id: Date.now().toString(),
      title: 'New Resume',
      template: this.state.selectedTemplate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.setState({ 
      currentPage: 'editor',
      currentResume: this.state.currentResume 
    });
  }

  selectTemplate(templateId) {
    console.log('🎨 selectTemplate called with:', templateId);
    
    if (!templateId) {
      console.error('❌ No template ID provided');
      return;
    }
    
    // Create a new resume with this template and navigate to editor
    this.state.currentResume = {
      id: Date.now().toString(),
      title: `New ${templateId.charAt(0).toUpperCase() + templateId.slice(1)} Resume`,
      template: templateId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('✅ Created resume:', this.state.currentResume);
    
    this.setState({ 
      currentPage: 'editor',
      currentResume: this.state.currentResume,
      selectedTemplate: templateId
    });
    
    console.log('✅ State updated, navigating to editor');
  }

  editResume(id) {
    const resume = this.state.resumes.find(r => r.id === id);
    if (resume) {
      this.setState({ 
        currentPage: 'editor',
        currentResume: resume 
      });
    }
  }

  deleteResume(id) {
    if (confirm('Are you sure you want to delete this resume?')) {
      this.setState({
        resumes: this.state.resumes.filter(r => r.id !== id)
      });
    }
  }

  goBack() {
    this.setState({ currentPage: 'dashboard' });
  }

  async exportPdf() {
    try {
      console.log('📥 Starting PDF export...');
      
      // Show loading spinner
      this.showLoadingSpinner('Generating PDF...');
      
      // Prepare CV data in the format expected by the API
      const cvData = {
        contact: {
          full_name: this.state.resumeData.contact.fullName || 'User',
          email: this.state.resumeData.contact.email || undefined,
          phone: this.state.resumeData.contact.phone || undefined,
          location: this.state.resumeData.contact.location || undefined,
          linkedin: this.state.resumeData.contact.linkedin || undefined,
          github: this.state.resumeData.contact.github || undefined,
          website: this.state.resumeData.contact.website || undefined,
          portfolio: this.state.resumeData.contact.portfolio || undefined
        },
        summary: this.state.resumeData.professional_summary || '',
        experience: (this.state.resumeData.experience || []).map(exp => ({
          company: exp.company || '',
          position: exp.job_title || '',
          location: exp.location || '',
          start_date: exp.start_date || '',
          end_date: exp.end_date || '',
          description: exp.description || '',
          achievements: [],
          technologies: exp.technologies ? (typeof exp.technologies === 'string' ? exp.technologies.split(',').map(t => t.trim()) : exp.technologies) : []
        })),
        education: (this.state.resumeData.education || []).map(edu => ({
          institution: edu.school || '',
          degree: edu.degree || '',
          field_of_study: edu.field || '',
          location: edu.location || '',
          start_date: edu.start_date || '',
          end_date: edu.end_date || '',
          gpa: edu.gpa || '',
          honors: []
        })),
        projects: (this.state.resumeData.projects || []).map(proj => ({
          name: proj.name || '',
          description: proj.description || '',
          url: proj.url || '',
          repository: proj.repository || '',
          technologies: typeof proj.technologies === 'string' ? proj.technologies.split(',').map(t => t.trim()) : (proj.technologies || [])
        })),
        skills: this.state.resumeData.skills || [],
        certifications: [],
        languages: this.state.resumeData.languages || [],
        awards: [],
        publications: [],
        volunteer: [],
        future_goals: this.state.resumeData.future_goals || ''
      };
      
      console.log('📋 CV Data prepared:', cvData);
      
      // Call the export API
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cv_data: cvData,
          format: 'pdf',
          style: this.state.selectedTemplate || 'modern'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Export failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Export response:', data);
      
      if (data.success && data.download_url) {
        // Download the file
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = `resume_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('📥 PDF downloaded successfully');
        alert('✅ PDF downloaded successfully!');
      } else {
        throw new Error(data.message || 'Export failed: No download URL received');
      }
      
    } catch (error) {
      console.error('❌ PDF export error:', error);
      alert(`❌ PDF export failed: ${error.message}`);
    } finally {
      this.hideLoadingSpinner();
    }
  }

  exportDocx() {
    console.log('Exporting to DOCX...');
    alert('DOCX export feature coming soon!');
  }

  togglePreview() {
    console.log('Toggle preview');
  }

  sendChatMessage() {
    console.log('Send message');
  }

  async enhanceText(fieldPath) {
    try {
      // Safety check - ensure fieldPath is provided
      if (!fieldPath || typeof fieldPath !== 'string') {
        console.error('❌ No field path provided to enhanceText:', fieldPath);
        alert('Error: Could not identify which field to enhance');
        return;
      }

      // Parse field path (e.g., "professional_summary" or "experience.0.description")
      const parts = fieldPath.split('.');
      let currentText = null;
      let fieldType = null;
      let experienceIndex = null;
      let educationIndex = null;
      let projectIndex = null;

      if (parts[0] === 'professional_summary') {
        currentText = this.state.resumeData.professional_summary;
        fieldType = 'summary';
      } else if (parts[0] === 'experience' && parts.length === 3 && parts[2] === 'description') {
        experienceIndex = parseInt(parts[1]);
        currentText = this.state.resumeData.experience[experienceIndex]?.description;
        fieldType = 'experience_description';
      } else if (parts[0] === 'experience' && parts.length === 3 && parts[2] === 'job_title') {
        experienceIndex = parseInt(parts[1]);
        currentText = this.state.resumeData.experience[experienceIndex]?.job_title;
        fieldType = 'job_title';
      } else if (parts[0] === 'education' && parts.length === 3 && parts[2] === 'degree') {
        educationIndex = parseInt(parts[1]);
        currentText = this.state.resumeData.education[educationIndex]?.degree;
        fieldType = 'degree';
      } else if (parts[0] === 'projects' && parts.length === 3 && parts[2] === 'description') {
        projectIndex = parseInt(parts[1]);
        currentText = this.state.resumeData.projects[projectIndex]?.description;
        fieldType = 'project_description';
      } else if (parts[0] === 'projects' && parts.length === 3 && parts[2] === 'technologies') {
        projectIndex = parseInt(parts[1]);
        const tech = this.state.resumeData.projects[projectIndex]?.technologies;
        // Handle both string and array formats
        if (typeof tech === 'string') {
          currentText = tech;
        } else if (Array.isArray(tech)) {
          currentText = tech.join(', ');
        } else {
          currentText = '';
        }
        fieldType = 'project_technologies';
      }

      if (!currentText || currentText.trim() === '') {
        alert('Please write something first before enhancing');
        return;
      }

      // Show loading state
      this.showLoadingSpinner('Enhancing with AI...');

      // Get email - only include if it's valid format
      let email = this.state.resumeData.contact.email || undefined;
      if (email && !email.includes('@')) {
        email = undefined; // Remove invalid email
      }

      // Create a proper CVData structure for the API
      const cvData = {
        contact: {
          full_name: this.state.resumeData.contact.fullName || 'User',
          email: email, // Only include if valid
          phone: this.state.resumeData.contact.phone || undefined,
          location: this.state.resumeData.contact.location || undefined,
          linkedin: this.state.resumeData.contact.linkedin || undefined,
          website: this.state.resumeData.contact.website || undefined
        },
        summary: this.state.resumeData.professional_summary || '',
        experience: (this.state.resumeData.experience || []).map(exp => ({
          company: exp.company || '',
          position: exp.job_title || '',
          start_date: exp.start_date || '',
          end_date: exp.end_date || '',
          description: exp.description || '',
          achievements: [],
          technologies: []
        })),
        education: (this.state.resumeData.education || []).map(edu => ({
          institution: edu.school || '',
          degree: edu.degree || '',
          field_of_study: edu.field || '',
          start_date: edu.start_date || '',
          end_date: edu.end_date || ''
        })),
        projects: (this.state.resumeData.projects || []).map(proj => ({
          name: proj.name || '',
          description: proj.description || '',
          url: proj.url || '',
          repository: proj.repository || '',
          technologies: typeof proj.technologies === 'string' 
            ? proj.technologies.split(',').map(t => t.trim()).filter(t => t)
            : (proj.technologies || [])
        })),
        skills: this.state.resumeData.skills || [],
        certifications: [],
        languages: this.state.resumeData.languages || []
      };

      // Clean up the cvData object - remove undefined values from contact
      Object.keys(cvData.contact).forEach(key => {
        if (cvData.contact[key] === undefined) {
          delete cvData.contact[key];
        }
      });

      // Determine which enhancement endpoints to use
      const enhanceExperience = fieldType === 'experience_description' || fieldType === 'job_title';

      // Call the enhancement API
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cv_data: cvData,
          target_role: '',
          enhancement_focus: ['clarity', 'impact', 'professionalism', 'grammar'],
          enhance_summary: fieldType === 'summary',
          enhance_experience: enhanceExperience,
          enhance_project: fieldType === 'project_description' || fieldType === 'project_technologies',
          quantify_achievements: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Extract meaningful error message from validation errors or API errors
        let errorMsg = response.statusText;
        let detailedMsg = '';
        
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMsg = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            // It's a validation error array
            errorMsg = errorData.detail.map(err => {
              const field = err.loc ? err.loc.join('.') : 'unknown';
              return `${field}: ${err.msg}`;
            }).join(' | ');
          }
        } else if (errorData.error && typeof errorData.error === 'object') {
          // OpenAI API error
          errorMsg = errorData.error.message || response.statusText;
          if (errorData.error.code === 'insufficient_quota') {
            detailedMsg = '\n\n💳 OpenAI Quota Issue:\n' +
              '1. Check: https://platform.openai.com/account/billing/overview\n' +
              '2. Add payment method if needed\n' +
              '3. Restart the server after updating billing\n' +
              '4. Try again';
          }
        }
        
        throw new Error(errorMsg + detailedMsg);
      }

      const data = await response.json();
      
      if (fieldType === 'summary' && data.enhanced_cv && data.enhanced_cv.summary) {
        // Update professional summary
        this.state.resumeData.professional_summary = data.enhanced_cv.summary;
        
        // Update the textarea
        const textarea = document.querySelector(`[data-field="professional_summary"]`);
        if (textarea) {
          textarea.value = data.enhanced_cv.summary;
        }
        
        // Update preview
        this.updateLivePreview();
        
        alert('✨ Professional Summary Enhanced!');
      } else if (fieldType === 'job_title' && data.enhanced_cv && data.enhanced_cv.experience && data.enhanced_cv.experience[experienceIndex]) {
        // Update job title with corrected version
        const enhancedExp = data.enhanced_cv.experience[experienceIndex];
        
        // Check if position was corrected
        if (enhancedExp.position && enhancedExp.position !== this.state.resumeData.experience[experienceIndex].job_title) {
          this.state.resumeData.experience[experienceIndex].job_title = enhancedExp.position;
          
          // Update the input field
          const input = document.querySelector(`[data-field="experience.${experienceIndex}.job_title"]`);
          if (input) {
            input.value = enhancedExp.position;
          }
          
          // Update preview
          this.updateLivePreview();
          
          alert(`✨ Job Title Corrected!\n"${currentText}" → "${enhancedExp.position}"`);
        } else {
          alert('✅ Job Title is already correct and professional!');
        }
      } else if (fieldType === 'experience_description' && data.enhanced_cv && data.enhanced_cv.experience && data.enhanced_cv.experience[experienceIndex]) {
        // Update experience description with enhanced version
        const enhancedExp = data.enhanced_cv.experience[experienceIndex];
        
        // Get enhanced bullets (achievements converted to description format)
        if (enhancedExp.achievements && enhancedExp.achievements.length > 0) {
          // Convert bullet points to formatted text
          const enhancedText = enhancedExp.achievements.join('\n• ');
          this.state.resumeData.experience[experienceIndex].description = '• ' + enhancedText;
        } else if (enhancedExp.description) {
          this.state.resumeData.experience[experienceIndex].description = enhancedExp.description;
        }
        
        // Update the textarea
        const textarea = document.querySelector(`[data-field="experience.${experienceIndex}.description"]`);
        if (textarea) {
          textarea.value = this.state.resumeData.experience[experienceIndex].description;
        }
        
        // Update preview
        this.updateLivePreview();
        
        alert('✨ Experience Description Enhanced with bullet points!');
      } else if (fieldType === 'degree' && data.enhanced_cv && data.enhanced_cv.education && data.enhanced_cv.education[educationIndex]) {
        // Update degree with enhanced version
        const enhancedEdu = data.enhanced_cv.education[educationIndex];
        
        // Check if degree was enhanced/corrected
        if (enhancedEdu.degree && enhancedEdu.degree !== this.state.resumeData.education[educationIndex].degree) {
          this.state.resumeData.education[educationIndex].degree = enhancedEdu.degree;
          
          // Update the input field
          const input = document.querySelector(`[data-field="education.${educationIndex}.degree"]`);
          if (input) {
            input.value = enhancedEdu.degree;
          }
          
          // Update preview
          this.updateLivePreview();
          
          alert(`✨ Degree Enhanced!\n"${currentText}" → "${enhancedEdu.degree}"`);
        } else {
          alert('✅ Degree is already well-formatted and professional!');
        }
      } else if (fieldType === 'project_description' && data.enhanced_cv && data.enhanced_cv.projects && data.enhanced_cv.projects[projectIndex]) {
        // Update project description with enhanced version
        const enhancedProj = data.enhanced_cv.projects[projectIndex];
        
        if (enhancedProj.description && enhancedProj.description !== this.state.resumeData.projects[projectIndex].description) {
          this.state.resumeData.projects[projectIndex].description = enhancedProj.description;
          
          // Update the textarea
          const textarea = document.querySelector(`[data-field="projects.${projectIndex}.description"]`);
          if (textarea) {
            textarea.value = enhancedProj.description;
          }
          
          // Update preview
          this.updateLivePreview();
          
          alert('✨ Project Description Enhanced!');
        } else {
          alert('✅ Project Description is already well-written!');
        }
      } else if (fieldType === 'project_technologies' && data.enhanced_cv && data.enhanced_cv.projects && data.enhanced_cv.projects[projectIndex]) {
        // Update project technologies with enhanced version
        const enhancedProj = data.enhanced_cv.projects[projectIndex];
        
        if (enhancedProj.technologies && enhancedProj.technologies.length > 0) {
          this.state.resumeData.projects[projectIndex].technologies = enhancedProj.technologies;
          
          // Update the input field
          const input = document.querySelector(`[data-field="projects.${projectIndex}.technologies"]`);
          if (input) {
            input.value = enhancedProj.technologies.join(', ');
          }
          
          // Update preview
          this.updateLivePreview();
          
          alert('✨ Technologies List Enhanced!');
        } else {
          alert('✅ Technologies list is already well-formatted!');
        }
      } else {
        throw new Error('No enhanced content returned');
      }
    } catch (error) {
      console.error('Error enhancing text:', error);
      alert(`Enhancement failed: ${error.message}`);
    } finally {
      this.hideLoadingSpinner();
    }
  }

  showLoadingSpinner(message = 'Loading...') {
    const spinner = document.createElement('div');
    spinner.id = 'loading-spinner';
    spinner.className = 'loading-spinner';
    spinner.innerHTML = `
      <div class="spinner-content">
        <div class="spinner"></div>
        <p>${message}</p>
      </div>
    `;
    document.body.appendChild(spinner);
  }

  hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
      spinner.remove();
    }
  }

  aiGenerate() {
    alert('AI generation feature coming soon!');
  }

  addExperience() {
    this.state.resumeData.experience.push({
      company: '',
      job_title: '',
      start_date: '',
      end_date: '',
      duration: '',
      description: ''
    });
    this.renderApp();
  }

  removeExperience(index) {
    this.state.resumeData.experience.splice(index, 1);
    this.renderApp();
  }

  addEducation() {
    this.state.resumeData.education.push({
      school: '',
      year: '',
      degree: ''
    });
    this.renderApp();
  }

  removeEducation(index) {
    this.state.resumeData.education.splice(index, 1);
    this.renderApp();
  }

  addProject() {
    this.state.resumeData.projects.push({
      name: '',
      description: '',
      url: '',
      repository: '',
      technologies: []
    });
    this.renderApp();
  }

  removeProject(index) {
    this.state.resumeData.projects.splice(index, 1);
    this.renderApp();
  }

  async addSkill() {
    console.log('🔍 addSkill called');
    const skillInput = document.querySelector('.skills-input input') || document.querySelector('#skill-input');
    console.log('🔍 Input element found:', skillInput);
    console.log('🔍 Input element HTML:', skillInput ? skillInput.outerHTML : 'NOT FOUND');
    
    if (skillInput && skillInput.value.trim()) {
      const rawSkill = skillInput.value.trim();
      console.log('📝 Adding skill from input:', rawSkill);
      
      // Clear input immediately
      skillInput.value = '';
      
      // Validate skill with LLM
      await this.validateAndAddSkill(rawSkill);
    } else {
      console.log('⚠️ Skill input is empty or not found');
      if (!skillInput) {
        console.log('❌ Could not find skill input element');
        console.log('🔍 Trying alternate selectors:');
        console.log('  - #skill-input:', document.querySelector('#skill-input'));
        console.log('  - .skills-input input:', document.querySelector('.skills-input input'));
        console.log('  - All inputs:', document.querySelectorAll('input'));
      }
    }
  }

  async validateAndAddSkill(rawSkill) {
    try {
      console.log('🎯 validateAndAddSkill called with:', rawSkill);
      this.showLoadingSpinner('Validating skill...');

      // Call validation API
      const requestPayload = { skill: rawSkill };
      console.log('📤 Sending request payload:', JSON.stringify(requestPayload));
      
      const response = await fetch('/api/validate-skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });

      if (!response.ok) {
        console.log('❌ Response not OK, parsing error data');
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ Error data:', errorData);
        let errorMsg = response.statusText;
        
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : 'Failed to validate skill';
        }
        
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);
      
      if (data.success) {
        // Use the skill returned by the API (normalized/validated)
        const validatedSkill = data.skill || rawSkill;
        const isStandard = data.is_standard;
        
        console.log('✅ Validation successful:');
        console.log('   - validatedSkill:', validatedSkill);
        console.log('   - isStandard:', isStandard);
        
        // Show confirmation modal
        this.showSkillValidationConfirmation(rawSkill, validatedSkill, !isStandard);
      } else {
        console.log('❌ data.success is false or undefined');
        console.log('❌ Full response:', data);
        alert('Unable to validate skill. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error validating skill:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      alert(`Skill validation failed: ${error.message}`);
    } finally {
      this.hideLoadingSpinner();
    }
  }

  showSkillValidationConfirmation(rawSkill, validatedSkill, correctionApplied) {
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'skill-validation-modal';
    
    const appInstance = this; // Capture 'this' context
    
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>✅ Skill Validation</h3>
          <button class="modal-close" data-action="close-modal">×</button>
        </div>
        <div class="modal-body">
          ${correctionApplied ? `
            <div class="validation-info">
              <p><strong>Original:</strong> "${rawSkill}"</p>
              <p><strong>Corrected:</strong> "${validatedSkill}"</p>
              <p class="validation-message">✨ Skill has been corrected to industry-standard format</p>
            </div>
          ` : `
            <div class="validation-info">
              <p><strong>Skill:</strong> "${validatedSkill}"</p>
              <p class="validation-message">✅ Skill is correctly formatted</p>
            </div>
          `}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-action="cancel-skill">Cancel</button>
          <button class="btn btn-primary" data-action="confirm-skill">Add Skill</button>
        </div>
      </div>
    `;

    // Add event listeners
    const closeBtn = modal.querySelector('[data-action="close-modal"]');
    const cancelBtn = modal.querySelector('[data-action="cancel-skill"]');
    const confirmBtn = modal.querySelector('[data-action="confirm-skill"]');
    
    const closeModal = () => {
      modal.remove();
    };
    
    const addSkill = () => {
      // Check if skill already exists
      const existingSkills = new Set(appInstance.state.resumeData.skills.map(s => s.toLowerCase()));
      if (!existingSkills.has(validatedSkill.toLowerCase())) {
        console.log('✨ Adding skill to state:', validatedSkill);
        console.log('   Current skills before:', appInstance.state.resumeData.skills);
        
        appInstance.state.resumeData.skills.push(validatedSkill);
        
        console.log('   Current skills after:', appInstance.state.resumeData.skills);
        console.log('   Total skills:', appInstance.state.resumeData.skills.length);
        
        // Close modal before rendering to avoid issues
        modal.remove();
        
        console.log('🔄 Rendering app with updated skills...');
        appInstance.renderApp();
        
        // Re-attach event listeners after render
        console.log('� Re-attaching event listeners...');
        setTimeout(() => {
          appInstance.setupEventListeners();
          console.log('✅ Skill successfully added and visible in preview!');
        }, 100);
        
        alert(`✅ Skill added: "${validatedSkill}"`);
      } else {
        console.log('⚠️ Skill already exists:', validatedSkill);
        alert(`"${validatedSkill}" is already in your skills list!`);
        modal.remove();
      }
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', addSkill);

    document.body.appendChild(modal);
  }

  removeSkill(index) {
    this.state.resumeData.skills.splice(index, 1);
    this.renderApp();
  }

  async suggestSkills() {
    try {
      // Check if there's anything to analyze
      const hasExperience = this.state.resumeData.experience && this.state.resumeData.experience.length > 0;
      const hasProjects = this.state.resumeData.projects && this.state.resumeData.projects.length > 0;
      
      if (!hasExperience && !hasProjects) {
        alert('Please add at least one experience entry or project to get skill suggestions');
        return;
      }

      this.showLoadingSpinner('Analyzing experience and projects for skills...');

      // Create a proper CVData structure for the API
      const cvData = {
        contact: {
          full_name: this.state.resumeData.contact.fullName || 'User',
          email: this.state.resumeData.contact.email || undefined,
          phone: this.state.resumeData.contact.phone || undefined,
          location: this.state.resumeData.contact.location || undefined
        },
        summary: this.state.resumeData.professional_summary || '',
        experience: (this.state.resumeData.experience || []).map(exp => ({
          company: exp.company || '',
          position: exp.job_title || '',
          start_date: exp.start_date || '',
          end_date: exp.end_date || '',
          description: exp.description || '',
          achievements: [],
          technologies: []
        })),
        education: (this.state.resumeData.education || []).map(edu => ({
          institution: edu.school || '',
          degree: edu.degree || '',
          field_of_study: edu.field || '',
          start_date: edu.start_date || '',
          end_date: edu.end_date || ''
        })),
        projects: (this.state.resumeData.projects || []).map(proj => ({
          name: proj.name || '',
          description: proj.description || '',
          url: proj.url || '',
          repository: proj.repository || '',
          technologies: typeof proj.technologies === 'string' 
            ? proj.technologies.split(',').map(t => t.trim()).filter(t => t)
            : (proj.technologies || [])
        })),
        skills: this.state.resumeData.skills || [],
        certifications: [],
        languages: this.state.resumeData.languages || []
      };

      // Call the skills suggestion API
      const response = await fetch('/api/suggest-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cv_data: cvData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMsg = response.statusText;
        
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : 'Failed to suggest skills';
        } else if (errorData.error) {
          errorMsg = errorData.error.message || response.statusText;
        }
        
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      if (data.suggested_skills && Array.isArray(data.suggested_skills) && data.suggested_skills.length > 0) {
        // Show suggestions dialog
        this.showSkillsSuggestions(data.suggested_skills);
        alert(`✨ Found ${data.suggested_skills.length} suggested skills!`);
      } else {
        alert('No new skills found to suggest. Consider adding more experience or project details.');
      }
    } catch (error) {
      console.error('Error suggesting skills:', error);
      alert(`Failed to suggest skills: ${error.message}`);
    } finally {
      this.hideLoadingSpinner();
    }
  }

  showSkillsSuggestions(suggestedSkills) {
    // Filter out skills that are already in the list
    const existingSkills = new Set(this.state.resumeData.skills.map(s => s.toLowerCase()));
    const newSkills = suggestedSkills.filter(skill => !existingSkills.has(skill.toLowerCase()));
    
    if (newSkills.length === 0) {
      alert('All suggested skills are already in your list!');
      return;
    }

    // Create a modal to select which skills to add
    const modal = document.createElement('div');
    modal.className = 'skills-suggestion-modal';
    
    const appInstance = this; // Capture 'this' context
    
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>💡 Suggested Skills</h3>
          <button class="modal-close" data-action="close-suggestions">×</button>
        </div>
        <div class="modal-body">
          <p>Select skills to add to your profile:</p>
          <div class="skills-suggestions-grid">
            ${newSkills.map((skill, i) => `
              <label class="skill-checkbox">
                <input type="checkbox" data-skill="${skill}" checked>
                <span>${skill}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-action="cancel-suggestions">Cancel</button>
          <button class="btn btn-primary" data-action="add-selected-skills">Add Selected Skills</button>
        </div>
      </div>
    `;

    // Add event listeners with proper context
    const closeBtn = modal.querySelector('[data-action="close-suggestions"]');
    const cancelBtn = modal.querySelector('[data-action="cancel-suggestions"]');
    const addBtn = modal.querySelector('[data-action="add-selected-skills"]');
    
    const closeModal = () => {
      console.log('🔌 Closing suggestions modal');
      modal.remove();
    };
    
    const addSelectedSkills = () => {
      console.log('✨ Adding selected skills from suggestions');
      const checked = modal.querySelectorAll('.skill-checkbox input:checked');
      let addedCount = 0;
      
      checked.forEach(checkbox => {
        const skill = checkbox.dataset.skill;
        console.log('  - Checking skill:', skill);
        
        if (skill && !existingSkills.has(skill.toLowerCase())) {
          console.log('    ✅ Adding skill:', skill);
          appInstance.state.resumeData.skills.push(skill);
          addedCount++;
        } else {
          console.log('    ⚠️ Skill already exists or empty:', skill);
        }
      });
      
      console.log(`📋 Total skills added: ${addedCount}`);
      console.log('📋 All skills in state:', appInstance.state.resumeData.skills);
      
      modal.remove();
      
      if (addedCount > 0) {
        console.log('🔄 Rendering app...');
        appInstance.renderApp();
        alert(`✅ Added ${addedCount} skill(s) to your profile!`);
      } else {
        alert('No new skills selected!');
      }
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    addBtn.addEventListener('click', addSelectedSkills);

    document.body.appendChild(modal);
    console.log('💡 Skills suggestion modal opened with', newSkills.length, 'suggestions');
  }

  loadTemplates() {
    // Load templates from API or local storage
    this.state.templates = [
      { id: 'modern', name: 'Modern' },
      { id: 'classic', name: 'Classic' },
      { id: 'creative', name: 'Creative' }
    ];
  }

  async generateFutureGoals() {
    try {
      // Check if there's content to analyze
      const hasExperience = this.state.resumeData.experience && this.state.resumeData.experience.length > 0;
      const hasSummary = this.state.resumeData.professional_summary && this.state.resumeData.professional_summary.trim().length > 0;
      
      if (!hasExperience && !hasSummary) {
        alert('Please add at least one experience entry and/or a professional summary to generate future goals');
        return;
      }

      this.showLoadingSpinner('Generating future goals based on your experience and summary...');

      // Extract key information from experience and summary
      let experienceText = '';
      if (this.state.resumeData.experience.length > 0) {
        experienceText = this.state.resumeData.experience.map(exp => 
          `${exp.job_title} at ${exp.company}: ${exp.description}`
        ).join('\n');
      }

      const professionalSummary = this.state.resumeData.professional_summary || '';
      const skills = Array.isArray(this.state.resumeData.skills) 
        ? this.state.resumeData.skills.join(', ')
        : (this.state.resumeData.skills || '');

      // Build a comprehensive prompt for the LLM
      const prompt = `Based on the following professional background, generate meaningful career goals for the next 3-5 years:

Professional Summary:
${professionalSummary || 'Not provided'}

Work Experience:
${experienceText || 'Not provided'}

Skills:
${skills || 'Not provided'}

Generate a concise, professional statement about future career goals and aspirations. The statement should be personalized based on the provided background, realistic, and inspiring. Format it as a paragraph (not bullet points).`;

      console.log('📝 Sending prompt to API...');

      // Call the generate-future-goals endpoint
      const response = await fetch('/api/generate-future-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: prompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMsg = response.statusText;
        
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : 'Failed to generate future goals';
        }
        
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      if (data.enhanced_text) {
        // Set the future goals in state
        this.state.resumeData.future_goals = data.enhanced_text;
        
        // Update the textarea
        const textarea = document.querySelector('[data-field="future_goals"]');
        if (textarea) {
          textarea.value = data.enhanced_text;
        }
        
        console.log('✅ Future goals generated successfully!');
        alert('✨ Future goals generated successfully!');
        this.renderApp();
      } else {
        alert('Failed to generate future goals. Please try again.');
      }
    } catch (error) {
      console.error('Error generating future goals:', error);
      alert(`Failed to generate future goals: ${error.message}`);
    } finally {
      this.hideLoadingSpinner();
    }
  }
}

// ============================================================================
// INITIALIZE APP
// ============================================================================

function initializeApp() {
  console.log('Initializing Resume Builder App...');
  try {
    if (!document) {
      console.error('ERROR: document object not available');
      setTimeout(initializeApp, 100);
      return;
    }
    
    const appElement = document.getElementById('app');
    if (!appElement) {
      console.error('ERROR: app element not found, retrying...');
      setTimeout(initializeApp, 100);
      return;
    }
    
    console.log('✓ Creating app instance...');
    window.app = new ResumeBuilderApp();
    console.log('✓ App initialized successfully');
  } catch (error) {
    console.error('ERROR initializing app:', error);
    console.error('Stack:', error.stack);
  }
}

// Use DOMContentLoaded as primary trigger
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded
  initializeApp();
}
