// scenes/aiContextScene.js – wraps the original ai_context_demo.html as a reusable scene

export async function setup(root) {
  // 1. Inject HTML markup (body of original file minus <script> tags)
  const wrapper = document.createElement('div');
  wrapper.id = 'ai-context-scene';
  wrapper.innerHTML = `\n<div id="container">\n    <div id="three-container"></div>\n    <div id="ui-overlay">\n        <!-- Title -->\n        <div class="title">AI.CONTEXT.ANALYSIS</div>\n        <div class="user-id">USER_ID: AMINA_PARIS_7829</div>\n        <div class="mode-indicator" id="mode-indicator">STATIC.PROFILE.MODE</div>\n        \n        <!-- Terminal Panels -->\n        <div class="terminal-text left-panel" id="left-panel">\n            <div class="terminal-header">DEMOGRAPHICS.DAT</div>\n            <div id="left-content"></div>\n        </div>\n        \n        <div class="terminal-text right-panel" id="right-panel">\n            <div class="terminal-header">IDENTITY.DAT</div>\n            <div id="right-content"></div>\n        </div>\n        \n        <div class="terminal-text bottom-left-panel" id="bottom-left-panel">\n            <div class="terminal-header">CONTEXT.DAT</div>\n            <div id="bottom-left-content"></div>\n        </div>\n        \n        <div class="terminal-text bottom-right-panel" id="bottom-right-panel">\n            <div class="terminal-header">BEHAVIOR.DAT</div>\n            <div id="bottom-right-content"></div>\n        </div>\n        \n        <!-- Scenario indicator -->\n        <div class="scenario-indicator" id="scenario-indicator">WORKING.ALONE.FOCUSED</div>\n        \n        <!-- Status bar -->\n        <div class="status-bar" id="status-bar">BUILDING.STATIC.PROFILE...</div>\n        \n        <!-- Controls -->\n        <div class="controls">\n            SPACE: SWITCH.MODE • 1-4: SCENARIOS<span class="cursor"></span>\n        </div>\n        \n        <!-- Transition flash -->\n        <div class="transition-flash" id="transition-flash"></div>\n    </div>\n</div>\n`;
  root.appendChild(wrapper);

  // 2. Dynamically import and run the original inline logic from ai_context_demo.html so we avoid rewriting 800 lines here.
  //    We fetch the original file, extract its inline script and evaluate it in the current context.
  const res = await fetch('ai_context_demo.html');
  const htmlText = await res.text();
  const inlineCodeMatch = htmlText.match(/<script>([\s\S]*?)<\/script>/i);
  if (inlineCodeMatch && inlineCodeMatch[1]) {
    // eslint-disable-next-line no-eval
    eval(inlineCodeMatch[1]);
  } else {
    console.warn('Inline script not found – scene may be empty');
  }

  // Return a minimal teardown that just removes the wrapper; the original script does its own cleanup on unload.
  return {
    teardown() {
      try { wrapper.remove(); } catch(e) { /* ignore */ }
    }
  };
}

export default { setup }; 