using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Package.Reference.Project.Backend.Services
{
    public interface IExampleService
    {
        Task<string> GetExampleData();
    }
}
