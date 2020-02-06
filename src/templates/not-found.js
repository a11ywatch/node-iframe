const WEBSITE_NOT_FOUND_TEMPLATE = `
<div style="padding:12px; color: #121212;">
<h1>Error</h1>
<h2>Website not found, please check your url and try again.</h2>
<button onclick="window.history.back()">Go Back</button>
</div>
`;

module.exports = {
  WEBSITE_NOT_FOUND_TEMPLATE
};
