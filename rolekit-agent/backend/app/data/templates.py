TEMPLATES = [
    {
        "id": "modern-blue",
        "name": "Modern Blue",
        "category": "professional",
        "html_template": """
        <html>
            <head><style>%TEMPLATE_CSS%</style></head>
            <body>
                <div class="container">
                    <header>{{ contact.full_name }}</header>
                    <section>
                        <h2>Summary</h2>
                        <p>{{ summary.summary }}</p>
                    </section>
                </div>
            </body>
        </html>
        """,
        "css_styles": """
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 40px; color: #1e293b; }
        header { color: white; background: linear-gradient(135deg, #007AFF, #5856D6); padding: 32px; font-size: 32px; }
        h2 { color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        """,
        "preview_image_url": None,
        "is_ats_optimized": True,
        "is_active": True,
    },
    {
        "id": "minimal-sand",
        "name": "Minimal Sand",
        "category": "creative",
        "html_template": """
        <html>
          <head><style>%TEMPLATE_CSS%</style></head>
          <body>
            <div class="wrapper">
              <div class="sidebar">
                <h1>{{ contact.full_name }}</h1>
                <p>{{ contact.email }}</p>
                <p>{{ contact.phone }}</p>
              </div>
              <div class="content">
                <section>
                  <h2>Summary</h2>
                  <p>{{ summary.summary }}</p>
                </section>
              </div>
            </div>
          </body>
        </html>
        """,
        "css_styles": """
        body { font-family: 'Inter', sans-serif; background: #fffaf0; margin: 0; }
        .wrapper { display: grid; grid-template-columns: 250px 1fr; min-height: 100vh; }
        .sidebar { background: #fef3c7; padding: 32px; }
        .content { padding: 48px; }
        """,
        "preview_image_url": None,
        "is_ats_optimized": True,
        "is_active": True,
    },
    {
        "id": "sleek-carbon",
        "name": "Sleek Carbon",
        "category": "executive",
        "html_template": """
        <html>
          <head><style>%TEMPLATE_CSS%</style></head>
          <body>
            <div class="card">
              <header>
                <h1>{{ contact.full_name }}</h1>
                <p>{{ summary.headline }}</p>
              </header>
              <section>
                <h2>Experience</h2>
                {% for role in experience %}
                  <div class="role">
                    <strong>{{ role.role }} @ {{ role.company }}</strong>
                    <span>{{ role.location }}</span>
                  </div>
                {% endfor %}
              </section>
            </div>
          </body>
        </html>
        """,
        "css_styles": """
        body { font-family: 'Nunito', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 40px; }
        .card { background: #1e293b; border-radius: 24px; padding: 48px; }
        header h1 { margin: 0; font-size: 42px; }
        h2 { color: #38bdf8; letter-spacing: 0.1em; text-transform: uppercase; font-size: 14px; margin-top: 32px; }
        """,
        "preview_image_url": None,
        "is_ats_optimized": True,
        "is_active": True,
    },
]

