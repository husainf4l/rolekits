# Validate Skill Endpoint - Integration Guide

## Quick Start

The **validate-skill** endpoint validates whether a skill is recognized as a standard skill or categorizes it as custom.

### Basic Usage

```bash
curl -X POST http://localhost:8002/api/validate-skill \
  -H "Content-Type: application/json" \
  -d '{"skill": "Python"}'
```

---

## Integration Examples

### JavaScript/Frontend Integration

#### Using Fetch API

```javascript
// Basic skill validation
async function validateSkill(skill) {
    try {
        const response = await fetch('http://localhost:8002/api/validate-skill', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ skill })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Skill validation error:', error);
        return null;
    }
}

// Usage
validateSkill('Python').then(result => {
    console.log(result.is_standard ? 'Standard skill' : 'Custom skill');
});
```

#### React Component Example

```jsx
import { useState } from 'react';

export function SkillValidator() {
    const [skill, setSkill] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleValidate = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8002/api/validate-skill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill })
            });
            const data = await response.json();
            setResult(data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="skill-validator">
            <input
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="Enter skill name"
            />
            <button onClick={handleValidate} disabled={loading}>
                {loading ? 'Validating...' : 'Validate'}
            </button>

            {result && (
                <div className={`result ${result.is_standard ? 'standard' : 'custom'}`}>
                    <h3>{result.skill}</h3>
                    <p>Status: {result.status}</p>
                    <p className="badge">
                        {result.is_standard ? '✓ Standard Skill' : '◆ Custom Skill'}
                    </p>
                </div>
            )}
        </div>
    );
}
```

#### Vue 3 Component Example

```vue
<template>
    <div class="skill-validator">
        <input
            v-model="skill"
            @keyup.enter="validateSkill"
            placeholder="Enter skill name"
        />
        <button @click="validateSkill" :disabled="loading">
            {{ loading ? 'Validating...' : 'Validate' }}
        </button>

        <div v-if="result" :class="['result', result.is_standard ? 'standard' : 'custom']">
            <h3>{{ result.skill }}</h3>
            <p>Status: {{ result.status }}</p>
            <span class="badge">
                {{ result.is_standard ? '✓ Standard' : '◆ Custom' }}
            </span>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const skill = ref('');
const result = ref(null);
const loading = ref(false);

const validateSkill = async () => {
    loading.value = true;
    try {
        const response = await fetch('http://localhost:8002/api/validate-skill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill: skill.value })
        });
        result.value = await response.json();
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.result {
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 4px;
}

.result.standard {
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
}

.result.custom {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    color: #856404;
}

.badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    font-weight: bold;
    margin-top: 0.5rem;
}
</style>
```

### Python Integration

```python
import requests
from typing import Dict, Any

class SkillValidator:
    def __init__(self, base_url: str = "http://localhost:8002"):
        self.base_url = base_url
        self.endpoint = f"{base_url}/api/validate-skill"

    def validate(self, skill: str) -> Dict[str, Any]:
        """Validate a single skill"""
        response = requests.post(
            self.endpoint,
            json={"skill": skill}
        )
        return response.json()

    def validate_multiple(self, skills: list) -> Dict[str, Dict]:
        """Validate multiple skills"""
        results = {}
        for skill in skills:
            results[skill] = self.validate(skill)
        return results

    def filter_standard_skills(self, skills: list) -> list:
        """Return only standard skills"""
        return [
            skill for skill in skills
            if self.validate(skill).get('is_standard', False)
        ]

# Usage
validator = SkillValidator()

# Single skill
result = validator.validate('Python')
print(f"Is standard: {result['is_standard']}")

# Multiple skills
skills_data = validator.validate_multiple(['Python', 'React', 'MyCustomTool'])
for skill, data in skills_data.items():
    print(f"{skill}: {data['status']}")

# Filter standard skills
cv_skills = ['Python', 'Django', 'MyFramework', 'Leadership']
standard_only = validator.filter_standard_skills(cv_skills)
print(f"Standard skills: {standard_only}")
```

---

## Use Cases

### 1. CV Builder - Skill Input Validation

When adding skills to a CV, validate in real-time:

```javascript
function addSkillToCV(skill) {
    // Validate first
    validateSkill(skill).then(result => {
        if (result.success) {
            // Show visual indicator
            const badge = document.createElement('span');
            badge.className = result.is_standard ? 'badge-standard' : 'badge-custom';
            badge.textContent = skill;
            
            // Add to CV
            document.getElementById('cv-skills').appendChild(badge);
        }
    });
}
```

### 2. Job Matching - Skill Analysis

Analyze skills in job matching:

```python
from app.services.cv.job_matcher import JobMatcher
from requests_utils import SkillValidator

validator = SkillValidator()

def analyze_cv_for_job(cv_skills, job_required_skills):
    """Analyze how well CV skills match job requirements"""
    
    # Validate all skills
    cv_validated = {
        skill: validator.validate(skill)
        for skill in cv_skills
    }
    
    job_validated = {
        skill: validator.validate(skill)
        for skill in job_required_skills
    }
    
    # Calculate match score
    standard_cv_skills = [s for s, r in cv_validated.items() if r['is_standard']]
    required_standard_skills = [s for s, r in job_validated.items() if r['is_standard']]
    
    matches = len(set(standard_cv_skills) & set(required_standard_skills))
    match_percentage = (matches / len(required_standard_skills)) * 100
    
    return {
        'match_percentage': match_percentage,
        'matched_skills': list(set(standard_cv_skills) & set(required_standard_skills)),
        'missing_skills': [s for s in required_standard_skills if s not in standard_cv_skills]
    }
```

### 3. Skill Suggestion Enhancement

Combine with skill suggestions:

```python
def get_enhanced_suggestions(cv_text, job_description):
    """Get skill suggestions and validate them"""
    
    # Get suggestions
    suggestions_response = requests.post(
        'http://localhost:8002/api/suggest-skills',
        json={
            'cv_text': cv_text,
            'job_description': job_description
        }
    )
    
    suggestions = suggestions_response.json()
    
    # Validate each suggestion
    for skill_rec in suggestions['suggested_skills']:
        skill = skill_rec['skill']
        validation = requests.post(
            'http://localhost:8002/api/validate-skill',
            json={'skill': skill}
        ).json()
        
        skill_rec['validation'] = validation
        skill_rec['is_standard'] = validation['is_standard']
    
    return suggestions
```

### 4. Form Validation - Real-time Feedback

```javascript
// Real-time validation as user types
const skillInput = document.getElementById('skill-input');

skillInput.addEventListener('input', async (e) => {
    const skill = e.target.value.trim();
    
    if (skill.length < 2) {
        clearFeedback();
        return;
    }
    
    const result = await validateSkill(skill);
    
    if (result) {
        showFeedback(result.is_standard, result.status);
    }
});

function showFeedback(isStandard, status) {
    const feedback = document.getElementById('skill-feedback');
    feedback.className = isStandard ? 'feedback-success' : 'feedback-info';
    feedback.textContent = status;
    feedback.style.display = 'block';
}

function clearFeedback() {
    document.getElementById('skill-feedback').style.display = 'none';
}
```

---

## Error Handling

### Common Errors and Solutions

**400 Bad Request - Missing Skill Parameter**
```javascript
try {
    const response = await fetch('http://localhost:8002/api/validate-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: '' })  // Empty!
    });
    
    if (response.status === 400) {
        console.error('Missing skill parameter');
    }
} catch (error) {
    console.error('Request failed:', error);
}
```

**Connection Error**
```python
import requests
from requests.exceptions import ConnectionError, Timeout

try:
    response = requests.post(
        'http://localhost:8002/api/validate-skill',
        json={'skill': 'Python'},
        timeout=5  # 5 second timeout
    )
except ConnectionError:
    print('Cannot connect to server. Is it running?')
except Timeout:
    print('Request timed out')
```

---

## Performance Tips

1. **Batch Validations:**
   ```python
   # Instead of multiple requests
   skills = ['Python', 'React', 'Docker']
   for skill in skills:
       validate(skill)  # 3 requests
   
   # Consider local caching
   cache = {}
   for skill in skills:
       if skill not in cache:
           cache[skill] = validate(skill)
   ```

2. **Cache Results:**
   ```javascript
   const skillCache = new Map();
   
   async function validateSkillCached(skill) {
       if (skillCache.has(skill)) {
           return skillCache.get(skill);
       }
       
       const result = await validateSkill(skill);
       skillCache.set(skill, result);
       return result;
   }
   ```

3. **Debounce Input:**
   ```javascript
   function debounce(func, wait) {
       let timeout;
       return function(...args) {
           clearTimeout(timeout);
           timeout = setTimeout(() => func(...args), wait);
       };
   }
   
   const debouncedValidate = debounce(validateSkill, 300);
   skillInput.addEventListener('input', (e) => {
       debouncedValidate(e.target.value);
   });
   ```

---

## Testing

### Unit Tests

```python
import pytest
from unittest.mock import patch

@pytest.mark.asyncio
async def test_validate_standard_skill():
    response = await validate_skill({'skill': 'Python'})
    assert response['is_standard'] == True
    assert response['success'] == True

@pytest.mark.asyncio
async def test_validate_custom_skill():
    response = await validate_skill({'skill': 'MyCustomTool'})
    assert response['is_standard'] == False
    assert response['success'] == True

@pytest.mark.asyncio
async def test_validate_empty_skill():
    with pytest.raises(ValueError):
        await validate_skill({'skill': ''})
```

### Integration Tests

```bash
# Run all tests
python -m pytest tests/

# Test specific endpoint
pytest tests/test_validate_skill.py -v

# Test with coverage
pytest tests/test_validate_skill.py --cov=app.api.routes.phase2_routes
```

---

## Troubleshooting

**Endpoint not found (404)**
- Ensure server is running on port 8002
- Check URL is correct: `/api/validate-skill`
- Verify POST method is used

**Connection refused**
- Start the server: `python -m uvicorn main:app --reload --port 8002`
- Check if port 8002 is already in use

**Slow responses**
- Check server load
- Consider implementing request caching
- Validate server has adequate resources

---

## API Reference Quick Links

- **Main Endpoint:** `POST /api/validate-skill`
- **Suggest Skills:** `POST /api/suggest-skills`
- **Health Check:** `GET /api/health`
- **PDF Capabilities:** `GET /api/pdf/capabilities`

See [VALIDATE_SKILL_API.md](./VALIDATE_SKILL_API.md) for complete documentation.

---

*Integration Guide v1.0 - Phase 2 API*
