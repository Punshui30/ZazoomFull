import React, { useState } from 'react';
import { Book, FileText as FileIcon, Code, Terminal, Settings, Package, Truck, Users, Database, Link, Search, Wallet, MessageSquare } from 'lucide-react';

export function AdminDocs() {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: `# The Oracle's Handbook

Welcome to the comprehensive guide for ZaZoom's administration and development. This handbook contains everything you need to know about operating and maintaining the platform.

## Quick Start
1. Set up required accounts
2. Configure environment variables
3. Deploy your first update
4. Monitor system health`
    },
    {
      id: 'payment-system',
      title: 'Payment System',
      content: `## Blockchain Payment System

Our payment system uses a simple but effective approach:

### 1. Configuration
- Set VITE_ADMIN_WALLET in .env to your Bitcoin wallet address
- Configure Telegram bot token and chat ID for notifications
- No third-party payment processors needed

### 2. Payment Flow
1. Customer places order
2. System generates unique order ID
3. Customer sends payment to admin wallet
4. Blockchain monitor watches for transaction
5. Telegram bot notifies on payment receipt
6. Order status updates automatically

### 3. Monitoring Setup
- BlockchainMonitor class handles transaction watching
- WebSocket connection to blockchain.info
- Automatic payment amount verification
- Order status updates via Supabase
- Real-time driver notifications

### 4. Security Considerations
- Wallet address is public, read-only
- No private keys stored in application
- Automatic payment verification
- Transaction hash stored with order
- Double payment prevention

### 5. Troubleshooting
- Verify wallet address configuration
- Check Telegram bot connectivity
- Monitor WebSocket connection
- Validate transaction confirmations
- Track order status updates`
    },
    {
      id: 'telegram-integration',
      title: 'Telegram Integration',
      content: `## Telegram Bot Setup

### 1. Bot Configuration
- Create bot using @BotFather
- Store bot token in environment variables
- Configure webhook URL
- Set up driver chat group

### 2. Command Structure
- /accept_[orderid] - Accept delivery
- /pickup_[orderid] - Mark as picked up
- /delivered_[orderid] - Complete delivery
- /status - Check current assignments

### 3. Notification Types
- New order available
- Payment received
- Order accepted by driver
- Order picked up
- Order delivered

### 4. Security
- Verify driver chat IDs
- Validate command formats
- Check driver authorization
- Monitor bot activity
- Rate limit commands`
    },
    {
      id: 'deployment',
      title: 'Deployment Guide',
      content: `## Deployment Process

1. Pre-deployment Checklist
   - Verify environment variables
   - Test blockchain monitor
   - Check Telegram bot
   - Validate database access

2. Deployment Steps
   - Update environment variables
   - Deploy frontend to Netlify
   - Configure backend services
   - Update database schema
   - Test payment flow

3. Post-deployment
   - Verify wallet monitoring
   - Test Telegram notifications
   - Check order processing
   - Monitor system logs
   - Update documentation

4. Domain Configuration
   - Configure DNS for zazoom.store
   - Set up SSL certificates
   - Verify domain propagation
   - Test all endpoints`
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      content: `## Common Issues & Solutions

### Payment Issues
- Verify admin wallet address in .env
- Check blockchain WebSocket connection
- Confirm Telegram bot is active
- Validate order status updates
- Monitor transaction confirmations

### Telegram Bot Issues
- Verify bot token and chat ID
- Check webhook configuration
- Test command processing
- Monitor notification delivery
- Validate driver authentication

### Deployment Issues
- Environment variable configuration
- Database connectivity
- WebSocket connections
- SSL certificate setup
- Domain configuration`
    }
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-green-500/20">
        <div className="flex items-center mb-6">
          <Book className="w-6 h-6 text-green-500 mr-2" />
          <h2 className="text-2xl font-bold text-green-500">The Oracle's Handbook</h2>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500/50" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-green-500/20 rounded-lg py-2 pl-10 pr-4 text-green-400 placeholder-green-500/50 focus:outline-none focus:border-green-500/50"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center p-3 bg-black/30 rounded-lg border border-green-500/20 hover:bg-green-500/10 transition-colors"
            >
              {section.id === 'payment-system' ? (
                <Wallet className="w-5 h-5 text-green-500 mr-2" />
              ) : section.id === 'telegram-integration' ? (
                <MessageSquare className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <FileIcon className="w-5 h-5 text-green-500 mr-2" />
              )}
              <span className="text-green-400 text-sm">{section.title}</span>
            </a>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {filteredSections.map((section) => (
            <div key={section.id} id={section.id} className="prose prose-invert">
              <div className="bg-black/30 p-6 rounded-lg border border-green-500/20">
                <h3 className="text-xl font-bold text-green-500 mb-4">{section.title}</h3>
                <div className="text-green-400/80 space-y-4 whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-green-500/20">
          <h4 className="text-green-500 font-semibold mb-4">Quick Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://github.com/zazoom/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-black/30 rounded-lg border border-green-500/20 hover:bg-green-500/10 transition-colors"
            >
              <Code className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-400">GitHub Repository</span>
            </a>
            <a
              href="https://app.netlify.com/sites/zazoom"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-black/30 rounded-lg border border-green-500/20 hover:bg-green-500/10 transition-colors"
            >
              <Terminal className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-400">Netlify Dashboard</span>
            </a>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-black/30 rounded-lg border border-green-500/20 hover:bg-green-500/10 transition-colors"
            >
              <Database className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-400">Supabase Dashboard</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}