import re

with open('firestore.rules', 'r') as f:
    rules = f.read()

new_rules = """
    match /private_messages/{messageId} {
      allow read: if isSignedIn() && (
        resource.data.recipient_id == request.auth.uid ||
        resource.data.sender_id == request.auth.uid ||
        isStaffUser(request.auth.uid) ||
        isDeveloper()
      );
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && (
        resource.data.recipient_id == request.auth.uid ||
        resource.data.sender_id == request.auth.uid ||
        isStaffUser(request.auth.uid) ||
        isDeveloper()
      );
    }
"""

if 'match /private_messages/' not in rules:
    rules = rules.replace('match /secret_messages/{messageId} {', new_rules + '\n    match /secret_messages/{messageId} {')

with open('firestore.rules', 'w') as f:
    f.write(rules)
