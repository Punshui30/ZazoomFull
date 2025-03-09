import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const NetlifyTroubleshooter = () => {
  const issues = [
    {
      id: 1,
      type: 'critical',
      issue: 'Missing Netlify Configuration',
      description: 'No netlify.toml file found in the project root',
      solution: 'Create a netlify.toml file with proper build settings and redirects',
      example: `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`
    },
    {
      id: 2,
      type: 'warning',
      issue: 'Client-Side Routing',
      description: 'React Router may not work properly without redirect rules',
      solution: 'Add redirect rules in netlify.toml for client-side routing'
    },
    {
      id: 3,
      type: 'critical',
      issue: 'Build Output Directory',
      description: 'Incorrect publish directory in Netlify settings',
      solution: 'Verify build output directory matches Netlify publish directory (dist)'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 font-orbitron">
      <div className="border border-light-purple/30 rounded-lg p-4 bg-black/30">
        <h2 className="text-xl font-bold mb-4 text-light-purple">Netlify Deployment Troubleshooter</h2>
        
        <div className="space-y-4">
          {issues.map((issue) => (
            <div 
              key={issue.id}
              className="border border-light-purple/20 rounded-lg p-4 bg-black/20"
            >
              <div className="flex items-center gap-2 mb-2">
                {issue.type === 'critical' ? (
                  <XCircle className="text-red-400 w-5 h-5" />
                ) : (
                  <AlertTriangle className="text-yellow-400 w-5 h-5" />
                )}
                <h3 className="font-semibold text-white">{issue.issue}</h3>
              </div>
              
              <p className="text-gray-400 mb-2">{issue.description}</p>
              
              <div className="flex items-start gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                <p>{issue.solution}</p>
              </div>

              {issue.example && (
                <pre className="mt-2 p-3 bg-black/40 rounded border border-light-purple/20 text-sm overflow-x-auto">
                  <code className="text-green-400">{issue.example}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetlifyTroubleshooter;