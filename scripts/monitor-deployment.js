#!/usr/bin/env node

/**
 * Monitor Vercel deployment status
 * Automatically get build logs if deployment failed
 */

const https = require('https');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = 'flashcards';

if (!VERCEL_TOKEN) {
  console.error('Error: VERCEL_TOKEN not set');
  process.exit(1);
}

async function apiRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function monitorDeployment() {
  try {
    console.log('🔍 Checking latest deployment status...\n');

    // Get project details
    const project = await apiRequest('/v9/projects/flashcards');
    
    if (!project.latestDeployments || project.latestDeployments.length === 0) {
      console.log('ℹ️  No deployments found');
      return;
    }

    const latestDeploy = project.latestDeployments[0];
    const deploymentId = latestDeploy.id;
    const status = latestDeploy.readyState;
    const commit = latestDeploy.meta?.githubCommitMessage || 'Unknown';
    const timestamp = new Date(latestDeploy.createdAt).toLocaleString();

    console.log(`📦 Latest Deployment:`);
    console.log(`   ID: ${deploymentId}`);
    console.log(`   Status: ${status}`);
    console.log(`   Commit: "${commit}"`);
    console.log(`   Time: ${timestamp}`);
    console.log();

    if (status === 'READY') {
      console.log('✅ Deployment successful!');
      console.log(`   URL: https://flashcards-gamma-gold-91.vercel.app`);
      return;
    }

    if (status === 'ERROR') {
      console.log('❌ Deployment failed!\n');

      // Get deployment details with error info
      const deployment = await apiRequest(`/v10/deployments/${deploymentId}`);
      
      console.log('📋 Error Details:');
      console.log(`   Error Code: ${deployment.errorCode}`);
      console.log(`   Error Message: ${deployment.errorMessage}`);
      console.log();

      // Extract build logs from error message if available
      if (deployment.errorMessage) {
        console.log('🔧 Troubleshooting:');
        console.log(`   ${deployment.errorMessage}`);
        console.log();
      }

      console.log('💡 Next steps:');
      console.log('   1. Check build logs on Vercel dashboard');
      console.log('   2. Fix the error in the code');
      console.log('   3. Push to GitHub - Vercel will auto-redeploy');
      console.log();

      return;
    }

    if (status === 'BUILDING') {
      console.log('⏳ Deployment is still building...');
      return;
    }

    console.log(`⚠️  Deployment status: ${status}`);

  } catch (error) {
    console.error('Error monitoring deployment:', error.message);
    process.exit(1);
  }
}

monitorDeployment();
