using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Package.Reference.Project.Backend.Services.Implementation
{
    public class ExampleService : IExampleService
    {
        private Random Random { get; set; } = new Random(); 
        public async Task<string> GetExampleData()
        {
            await Task.Delay(1000);

            return "Example data: " + Random.Next(10,1000);
        }
    }
}
