const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient(process.env.AZURE_COSMOS_CONNECTION_STRING);
const database = client.database("jobsdb"); // Your Cosmos database name
const container = database.container("jobs"); // Your Cosmos container name

module.exports = async function (context, req) {
  try {
    if (req.method === "GET") {
      // Fetch all jobs
      const { resources: jobs } = await container.items
        .query("SELECT * FROM c")
        .fetchAll();

      context.res = {
        status: 200,
        body: jobs,
      };
    } else if (req.method === "POST") {
      // Ensure request body exists
      const job = req.body;
      if (!job || !job.title || !job.category) {
        context.res = { status: 400, body: "Missing required job fields" };
        return;
      }

      // Add an id if missing
      job.id = job.id || `job-${Date.now()}`;
      job.createdAt = new Date().toISOString();
      job.status = job.status || "open";

      const { resource: created } = await container.items.create(job);

      context.res = {
        status: 201,
        body: created,
      };
    } else {
      context.res = { status: 405, body: "Method Not Allowed" };
    }
  } catch (err) {
    console.error(err);
    context.res = { status: 500, body: "Server Error" };
  }
};
