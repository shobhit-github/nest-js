module.exports = {
  apps: [
			{
				name: "givemo-api",
				script: "./dist/main.js",
				env:
					{
					  NODE_ENV: "development",
					},
				env_production:
					{
					  NODE_ENV: "production",
					}
			}	
	]
}
