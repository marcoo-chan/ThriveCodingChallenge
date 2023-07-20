// Require 'fs' to work with the file system on your computer
const fs = require('fs');
const users_file = 'users.json'
const companies_file = 'companies.json'

let users, companies

// Read the user and company JSON files using parse and readFileSync
// Surround them in try catch blocks to handle potential file reading errors
function fileReader(file1, file2) {
  try {
    users = JSON.parse(fs.readFileSync(file1));
    console.log(`File ${file1} successfully read!`);
  } catch (userError) {
    console.error('Error reading users.json', userError.message);  
    process.exit(1);
  }

  try {
    companies = JSON.parse(fs.readFileSync(file2));
    console.log(`File ${file2} successfully read!`);
  } catch (companyError) {
    console.error('Error reading companies.json', companyError.message);  
    process.exit(1);
  }

  // Verify if json files users.json and companies.json contain data
  if (!users || users.length === 0) {
    console.error('Error: users.json is empty!');
    process.exit(1);
  }

  if (!companies || companies.length === 0) {
    console.error('Error: companies.json is empty!');
    process.exit(1);
  }
}

// Verify JSON files are in proper format and being read properly
// Surround them in try catch blocks to handle potential invalid file formatting
function isArray(array1, array2) {
  if (!Array.isArray(array1) || !Array.isArray(array2)) {
    console.error('Invalid JSON data: users.json and companies.json should be arrays!');
    process.exit(1);
  } else {
    console.log('Valid JSON data: users.json and companies.json are in array format!');
    console.log('There are ' + array1.length + ' users and ' + array2.length + ' companies.');
  }
}

// Find active users belonging to companies
// find() is a built in array method used to return the first element in the array if it satisfies the condition
function findActiveUsers(user) {
  return user.active_status && companies.find(company => company.id == user.company_id);
}

// Sort users by last name that are active by using the array 'activeUsers' created earlier
// localeCompare() is a built in string method used to compare strings
function sortLastName(x, y) {
  return x.last_name.localeCompare(y.last_name);
}

// Sort companies by ID (default order is ascending: 1, 2, 3, 4)
function sortCompanyID(x, y) {
  return x.id - y.id;
}

// Generate the output text
// NOTE: Token balance calculated by user's current tokens + company top up
function generateOutput(company, activeUsers) {
let companyOutput = '';

  // Determine number of active users per company, ex: company id: 6 should have 0 users
  const activeUsersForCompany = activeUsers.filter(user => user.company_id == company.id);
  console.log(company.name + ", # of active users: " + activeUsersForCompany.length);

  // If there are no active users for this company, skip generating output for this company
  if (activeUsersForCompany.length == 0) {
    console.log(`Data for company: ${company.name}, ID: ${company.id}, not generated due to no active users.`);
    return companyOutput;
  }
  
  companyOutput += `\tCompany Id: ${company.id}\n`;
  companyOutput += `\tCompany Name: ${company.name}\n`;

  // Generate the output text for users emailed
  // Users emailed defined by company email status and user email status being true
  companyOutput += '\tUsers Emailed:\n';
  activeUsers.forEach(user => {
    if (user.company_id == company.id && company.email_status && user.email_status) {
      companyOutput += `\t\t${user.last_name}, ${user.first_name}, ${user.email}\n`;
      companyOutput += `\t\t  Previous Token Balance, ${user.tokens}\n`;
      companyOutput += `\t\t  New Token Balance ${user.tokens + company.top_up}\n`;
    }
  });

  // Generate the output text for users not emailed
  // Users not emailed defined by company email status or user email status being false
  companyOutput += '\tUsers Not Emailed:\n';
  activeUsers.forEach(user => {
    if (user.company_id == company.id && (!company.email_status || !user.email_status)) {
      companyOutput += `\t\t${user.last_name}, ${user.first_name}, ${user.email}\n`;
      companyOutput += `\t\t  Previous Token Balance, ${user.tokens}\n`;
      companyOutput += `\t\t  New Token Balance ${user.tokens + company.top_up}\n`;
    }
  });

  // Generate the total top up per company
  // reduce() is a built in iterative method that accumulates all elements into a single value
  const totalTopUp = activeUsers.reduce((total, user) => {
    if (user.company_id == company.id) {
      return total + company.top_up;
    }
    return total;
  }, 0);
  
  companyOutput += `\t\tTotal amount of top ups for ${company.name}: ${totalTopUp}\n\n`;
  return companyOutput;
}

// Store the output to a file named 'output.txt'
// Surround them in try catch blocks to handle potential file generating errors
function generateOutputFile (output) {
  try {
    fs.writeFileSync('output.txt', output);
    console.log('Output.txt file generated successfully.');
    console.log('\n' + '=== OUTPUT ===' + '\n' + output);
  } catch (error) {
    console.error('Error generating file Output.txt', error.message);  
    process.exit(1);
  }
}

function main() {
  fileReader(users_file, companies_file);
  isArray(users, companies);

  // Create a new array called 'activeUsers' that filters active users belonging to companies
  // filter() is a built in array method used to create a new array filtered down to elements that pass the condition
  let activeUsers = users.filter(findActiveUsers);
  activeUsers.sort(sortLastName);
  companies.sort(sortCompanyID);

  // Initialize beginning of output with newline to match example_output.txt
  let output = `\n`;

  // Iterate through each company to generate the output
  companies.forEach(company => {
    output += generateOutput(company, activeUsers);
  });

  generateOutputFile(output);
}

main();