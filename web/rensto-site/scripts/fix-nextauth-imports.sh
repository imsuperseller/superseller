#!/bin/bash

echo "🔧 Fixing NextAuth imports..."

# Find all files with next-auth imports and comment them out
find src -name "*.ts" -o -name "*.tsx" | while read file; do
    if grep -q "next-auth" "$file"; then
        echo "Fixing: $file"
        # Comment out import lines containing next-auth
        sed -i '' 's/^import.*next-auth.*$/\/\/ &/' "$file"
        # Comment out getServerSession lines
        sed -i '' 's/^.*getServerSession.*next-auth.*$/\/\/ &/' "$file"
        # Comment out NextAuthOptions lines
        sed -i '' 's/^.*NextAuthOptions.*$/\/\/ &/' "$file"
        # Comment out CredentialsProvider lines
        sed -i '' 's/^.*CredentialsProvider.*$/\/\/ &/' "$file"
    fi
done

echo "✅ NextAuth imports fixed"
