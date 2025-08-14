#!/usr/bin/env node

/**
 * Mock Data Validation Script
 *
 * This script validates all mock data files against their TypeScript interfaces
 * and provides detailed feedback on any issues found.
 */

const fs = require("fs");
const path = require("path");

// Mock data file paths
const MOCK_FILES = {
  surge: path.join(__dirname, "../mock/surgeData.json"),
  income: path.join(__dirname, "../mock/incomeData.json"),
  subscription: path.join(__dirname, "../mock/subscriptionData.json"),
};

/**
 * Load and parse JSON file
 */
function loadJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load ${filePath}: ${error.message}`);
  }
}

/**
 * Validate surge data structure
 */
function validateSurgeData(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    errors.push("Data must be an object");
    return errors;
  }

  // Check required top-level properties
  if (!Array.isArray(data.surgeZones)) {
    errors.push("surgeZones must be an array");
  }

  if (!Array.isArray(data.recommendations)) {
    errors.push("recommendations must be an array");
  }

  if (!data.lastUpdated || typeof data.lastUpdated !== "string") {
    errors.push("lastUpdated must be a string");
  }

  // Validate surge zones
  if (Array.isArray(data.surgeZones)) {
    data.surgeZones.forEach((zone, index) => {
      if (!zone.id || typeof zone.id !== "string") {
        errors.push(`surgeZones[${index}].id must be a string`);
      }
      if (!zone.location || typeof zone.location !== "object") {
        errors.push(`surgeZones[${index}].location must be an object`);
      } else {
        if (typeof zone.location.lat !== "number") {
          errors.push(`surgeZones[${index}].location.lat must be a number`);
        }
        if (typeof zone.location.lng !== "number") {
          errors.push(`surgeZones[${index}].location.lng must be a number`);
        }
        if (!zone.location.name || typeof zone.location.name !== "string") {
          errors.push(`surgeZones[${index}].location.name must be a string`);
        }
      }
      if (typeof zone.multiplier !== "number") {
        errors.push(`surgeZones[${index}].multiplier must be a number`);
      }
      if (!zone.platform || typeof zone.platform !== "string") {
        errors.push(`surgeZones[${index}].platform must be a string`);
      }
      if (!zone.timestamp || typeof zone.timestamp !== "string") {
        errors.push(`surgeZones[${index}].timestamp must be a string`);
      }
      if (typeof zone.duration !== "number") {
        errors.push(`surgeZones[${index}].duration must be a number`);
      }
    });
  }

  // Validate recommendations
  if (Array.isArray(data.recommendations)) {
    data.recommendations.forEach((rec, index) => {
      if (!rec.id || typeof rec.id !== "string") {
        errors.push(`recommendations[${index}].id must be a string`);
      }
      if (!["surge", "demand", "bonus"].includes(rec.type)) {
        errors.push(
          `recommendations[${index}].type must be 'surge', 'demand', or 'bonus'`
        );
      }
      if (!rec.platform || typeof rec.platform !== "string") {
        errors.push(`recommendations[${index}].platform must be a string`);
      }
      if (!rec.title || typeof rec.title !== "string") {
        errors.push(`recommendations[${index}].title must be a string`);
      }
      if (!rec.description || typeof rec.description !== "string") {
        errors.push(`recommendations[${index}].description must be a string`);
      }
      if (typeof rec.estimatedEarnings !== "number") {
        errors.push(
          `recommendations[${index}].estimatedEarnings must be a number`
        );
      }
      if (typeof rec.confidence !== "number") {
        errors.push(`recommendations[${index}].confidence must be a number`);
      }
      if (!rec.timeWindow || typeof rec.timeWindow !== "object") {
        errors.push(`recommendations[${index}].timeWindow must be an object`);
      } else {
        if (!rec.timeWindow.start || typeof rec.timeWindow.start !== "string") {
          errors.push(
            `recommendations[${index}].timeWindow.start must be a string`
          );
        }
        if (!rec.timeWindow.end || typeof rec.timeWindow.end !== "string") {
          errors.push(
            `recommendations[${index}].timeWindow.end must be a string`
          );
        }
      }
    });
  }

  return errors;
}

/**
 * Validate income data structure
 */
function validateIncomeData(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    errors.push("Data must be an object");
    return errors;
  }

  // Check required top-level properties
  if (!Array.isArray(data.accounts)) {
    errors.push("accounts must be an array");
  }

  if (!Array.isArray(data.transactions)) {
    errors.push("transactions must be an array");
  }

  if (!data.summary || typeof data.summary !== "object") {
    errors.push("summary must be an object");
  }

  // Validate accounts
  if (Array.isArray(data.accounts)) {
    data.accounts.forEach((account, index) => {
      if (!account.id || typeof account.id !== "string") {
        errors.push(`accounts[${index}].id must be a string`);
      }
      if (!account.name || typeof account.name !== "string") {
        errors.push(`accounts[${index}].name must be a string`);
      }
      if (!["checking", "savings"].includes(account.type)) {
        errors.push(`accounts[${index}].type must be 'checking' or 'savings'`);
      }
      if (typeof account.balance !== "number") {
        errors.push(`accounts[${index}].balance must be a number`);
      }
      if (!account.platform || typeof account.platform !== "string") {
        errors.push(`accounts[${index}].platform must be a string`);
      }
      if (typeof account.isConnected !== "boolean") {
        errors.push(`accounts[${index}].isConnected must be a boolean`);
      }
      if (!account.lastSync || typeof account.lastSync !== "string") {
        errors.push(`accounts[${index}].lastSync must be a string`);
      }
    });
  }

  // Validate transactions
  if (Array.isArray(data.transactions)) {
    data.transactions.forEach((txn, index) => {
      if (!txn.id || typeof txn.id !== "string") {
        errors.push(`transactions[${index}].id must be a string`);
      }
      if (typeof txn.amount !== "number") {
        errors.push(`transactions[${index}].amount must be a number`);
      }
      if (!txn.description || typeof txn.description !== "string") {
        errors.push(`transactions[${index}].description must be a string`);
      }
      if (!txn.date || typeof txn.date !== "string") {
        errors.push(`transactions[${index}].date must be a string`);
      }
      if (!txn.platform || typeof txn.platform !== "string") {
        errors.push(`transactions[${index}].platform must be a string`);
      }
      if (!txn.category || typeof txn.category !== "string") {
        errors.push(`transactions[${index}].category must be a string`);
      }
      if (!txn.accountId || typeof txn.accountId !== "string") {
        errors.push(`transactions[${index}].accountId must be a string`);
      }
    });
  }

  // Validate summary
  if (data.summary && typeof data.summary === "object") {
    if (typeof data.summary.totalEarnings !== "number") {
      errors.push("summary.totalEarnings must be a number");
    }
    if (typeof data.summary.weeklyGoal !== "number") {
      errors.push("summary.weeklyGoal must be a number");
    }
    if (typeof data.summary.goalProgress !== "number") {
      errors.push("summary.goalProgress must be a number");
    }
    if (
      !data.summary.topPlatform ||
      typeof data.summary.topPlatform !== "string"
    ) {
      errors.push("summary.topPlatform must be a string");
    }
  }

  return errors;
}

/**
 * Validate subscription data structure
 */
function validateSubscriptionData(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    errors.push("Data must be an object");
    return errors;
  }

  // Check required top-level properties
  if (!data.status || typeof data.status !== "object") {
    errors.push("status must be an object");
  }

  if (!Array.isArray(data.availablePlans)) {
    errors.push("availablePlans must be an array");
  }

  if (!Array.isArray(data.features)) {
    errors.push("features must be an array");
  }

  // Validate status
  if (data.status && typeof data.status === "object") {
    if (typeof data.status.isActive !== "boolean") {
      errors.push("status.isActive must be a boolean");
    }
    if (!["free", "premium", "pro"].includes(data.status.tier)) {
      errors.push('status.tier must be "free", "premium", or "pro"');
    }
    if (!Array.isArray(data.status.features)) {
      errors.push("status.features must be an array");
    }
  }

  // Validate available plans
  if (Array.isArray(data.availablePlans)) {
    data.availablePlans.forEach((plan, index) => {
      if (!plan.id || typeof plan.id !== "string") {
        errors.push(`availablePlans[${index}].id must be a string`);
      }
      if (!["free", "premium", "pro"].includes(plan.tier)) {
        errors.push(
          `availablePlans[${index}].tier must be "free", "premium", or "pro"`
        );
      }
      if (!plan.name || typeof plan.name !== "string") {
        errors.push(`availablePlans[${index}].name must be a string`);
      }
      if (!plan.description || typeof plan.description !== "string") {
        errors.push(`availablePlans[${index}].description must be a string`);
      }
      if (typeof plan.price !== "number") {
        errors.push(`availablePlans[${index}].price must be a number`);
      }
      if (!plan.currency || typeof plan.currency !== "string") {
        errors.push(`availablePlans[${index}].currency must be a string`);
      }
      if (!["monthly", "yearly"].includes(plan.interval)) {
        errors.push(
          `availablePlans[${index}].interval must be "monthly" or "yearly"`
        );
      }
      if (!Array.isArray(plan.features)) {
        errors.push(`availablePlans[${index}].features must be an array`);
      }
    });
  }

  // Validate features
  if (Array.isArray(data.features)) {
    data.features.forEach((feature, index) => {
      if (!feature.id || typeof feature.id !== "string") {
        errors.push(`features[${index}].id must be a string`);
      }
      if (!feature.name || typeof feature.name !== "string") {
        errors.push(`features[${index}].name must be a string`);
      }
      if (!feature.description || typeof feature.description !== "string") {
        errors.push(`features[${index}].description must be a string`);
      }
      if (!["free", "premium", "pro"].includes(feature.tier)) {
        errors.push(
          `features[${index}].tier must be "free", "premium", or "pro"`
        );
      }
      if (typeof feature.isEnabled !== "boolean") {
        errors.push(`features[${index}].isEnabled must be a boolean`);
      }
    });
  }

  return errors;
}

/**
 * Main validation function
 */
function validateAllMockData() {
  console.log("🔍 Validating mock data files...\n");

  let totalErrors = 0;
  const results = {};

  // Validate each mock data file
  Object.entries(MOCK_FILES).forEach(([name, filePath]) => {
    console.log(`📄 Validating ${name} data...`);

    try {
      const data = loadJsonFile(filePath);
      let errors = [];

      switch (name) {
        case "surge":
          errors = validateSurgeData(data);
          break;
        case "income":
          errors = validateIncomeData(data);
          break;
        case "subscription":
          errors = validateSubscriptionData(data);
          break;
      }

      if (errors.length === 0) {
        console.log(`✅ ${name} data is valid`);
        results[name] = { valid: true };
      } else {
        console.log(`❌ ${name} data has ${errors.length} error(s):`);
        errors.forEach((error) => console.log(`   - ${error}`));
        results[name] = { valid: false, errors };
        totalErrors += errors.length;
      }
    } catch (error) {
      console.log(`❌ Failed to validate ${name} data: ${error.message}`);
      results[name] = { valid: false, errors: [error.message] };
      totalErrors += 1;
    }

    console.log("");
  });

  // Summary
  console.log("📊 Validation Summary:");
  console.log(`   Total files: ${Object.keys(MOCK_FILES).length}`);
  console.log(
    `   Valid files: ${Object.values(results).filter((r) => r.valid).length}`
  );
  console.log(
    `   Invalid files: ${Object.values(results).filter((r) => !r.valid).length}`
  );
  console.log(`   Total errors: ${totalErrors}`);

  if (totalErrors === 0) {
    console.log("\n🎉 All mock data files are valid!");
    process.exit(0);
  } else {
    console.log(
      "\n💥 Some mock data files have validation errors. Please fix them before proceeding."
    );
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateAllMockData();
}

module.exports = {
  validateAllMockData,
  validateSurgeData,
  validateIncomeData,
  validateSubscriptionData,
  loadJsonFile,
};
