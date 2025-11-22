// Copy and paste this code in your browser DevTools Console to test skill validation

console.log('🧪 Starting comprehensive skill validation test...\n');

// Test 1: Check if API endpoint is accessible
console.log('TEST 1: Checking API endpoint...');
fetch('/api/health')
  .then(r => r.json())
  .then(data => {
    console.log('✅ API is healthy:', data);
    
    // Test 2: Validate standard skill
    console.log('\n\nTEST 2: Validating standard skill "Python"...');
    return fetch('/api/validate-skill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skill: 'Python' })
    });
  })
  .then(r => {
    console.log('Response status:', r.status);
    return r.json();
  })
  .then(data => {
    console.log('✅ Response data:', data);
    if (data.success) {
      console.log('✅ API is working correctly!');
    } else {
      console.log('❌ API returned success: false');
    }
    
    // Test 3: Validate custom skill
    console.log('\n\nTEST 3: Validating custom skill "MyCustomTool"...');
    return fetch('/api/validate-skill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skill: 'MyCustomTool' })
    });
  })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Response data:', data);
    
    // Test 4: Check if skill input element exists
    console.log('\n\nTEST 4: Checking skill input element...');
    const skillInput = document.querySelector('#skill-input');
    console.log('Skill input element:', skillInput);
    if (skillInput) {
      console.log('✅ Skill input found');
      console.log('   - Value:', skillInput.value);
      console.log('   - Placeholder:', skillInput.placeholder);
    } else {
      console.log('❌ Skill input NOT found');
    }
    
    // Test 5: Check if resumeBuilder exists
    console.log('\n\nTEST 5: Checking ResumeBuilderApp instance...');
    if (window.app) {
      console.log('✅ ResumeBuilderApp instance found:', typeof window.app);
      console.log('   - Has addSkill method:', typeof window.app.addSkill);
      console.log('   - Has validateAndAddSkill method:', typeof window.app.validateAndAddSkill);
    } else {
      console.log('❌ ResumeBuilderApp instance NOT found in window.app');
    }
    
    console.log('\n\n✅ Test complete! All systems should be ready.');
    console.log('\nNow try manually adding a skill:');
    console.log('1. Type "Python" in the skill input field');
    console.log('2. Press Enter');
    console.log('3. Watch the console for debug logs');
  })
  .catch(error => {
    console.error('❌ Error during testing:', error);
  });
