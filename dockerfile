# Use an official Node.js runtime as a parent image for Firebase Functions (2nd gen)
# Check https://firebase.google.com/docs/functions/manage-functions#specify_a_nodejs_runtime
# For Node.js 18:
FROM us-docker.pkg.dev/google-appengine/fn/nodejs/base-18

# Or choose another supported version like base-16 or base-20

# Install poppler-utils (which includes pdftoppm)
USER root
RUN apt-get update && \
    apt-get install -y poppler-utils && \
    # Clean up apt cache to reduce image size
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
USER nodejs

# Copy the rest of your function's source code
COPY . .

# Install production dependencies.
RUN npm ci --only=production

# Expose the port Functions Framework listens on (optional, framework handles it)
# EXPOSE 8080

# Start the Functions Framework to host the function
# The entry point is typically defined in package.json's "main" and "scripts.start"
# or handled by Firebase CLI during deployment.
# For explicit control with functions-framework:
# CMD ["functions-framework", "--target=splitPdfToImages"]
# However, for Firebase, `firebase deploy` handles this.
