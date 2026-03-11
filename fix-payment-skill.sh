#!/bin/bash
cd /Users/apple/.openclaw/workspace/payment-skill-app

# Fix 1: wise.ts - Add customerTransactionId
cat > /tmp/fix_wise.py << 'PYEOF'
import re
with open('src/api/wise.ts', 'r') as f:
    content = f.read()

# Fix createTransfer
content = content.replace(
    '''async createTransfer(
    profileId: string,
    quoteId: string,
    targetAccountId: string,
    reference?: string
  ) {
    const body: any = {
      targetAccount: targetAccountId,
      quoteUuid: quoteId
    };''',
    '''async createTransfer(
    profileId: string,
    quoteId: string,
    targetAccountId: string,
    reference?: string,
    customerTransactionId?: string
  ) {
    const body: any = {
      targetAccount: targetAccountId,
      quoteUuid: quoteId,
      customerTransactionId: customerTransactionId or f"txn-{int(time.time())}"
    };'''
)

# Fix fundTransfer URL
content = content.replace(
    '/v3/profiles/${profileId}/transfers/${transferId}/payments',
    '/v1/transfers/${transferId}/payments'
)

with open('src/api/wise.ts', 'w') as f:
    f.write(content)
print("Fixed wise.ts")
PYEOF

python3 /tmp/fix_wise.py

# Fix 2: Add updateProvider to config.ts
cat > /tmp/fix_config.py << 'PYEOF'
with open('src/core/config.ts', 'r') as f:
    content = f.read()

if 'updateProvider' not in content:
    method = '''
  // Update provider without overwriting
  updateProvider(name: string, updates: Partial<ProviderConfig>): void {
    const current = this.config.providers[name];
    if (!current) throw new Error(`Provider ${name} not found`);
    this.config.providers[name] = { ...current, ...updates };
    this.saveConfig();
  }'''
    
    # Insert before last closing brace
    pos = content.rfind('}')
    content = content[:pos] + method + '\n' + content[pos:]
    
    with open('src/core/config.ts', 'w') as f:
        f.write(content)
    print("Fixed config.ts")
else:
    print("Already fixed")
PYEOF

python3 /tmp/fix_config.py

# Rebuild
npm run build && npm link

echo "✅ All fixes applied!"