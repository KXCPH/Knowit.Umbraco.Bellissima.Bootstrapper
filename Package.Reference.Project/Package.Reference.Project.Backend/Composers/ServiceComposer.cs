using Microsoft.Extensions.DependencyInjection;
using Package.Reference.Project.Backend.Services;
using Package.Reference.Project.Backend.Services.Implementation;
using Umbraco.Cms.Core.Composing;

namespace Package.Reference.Project.Backend.Composers
{
    public class ServiceComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            // example of registering a service
            builder.Services.AddScoped<IExampleService, ExampleService>();
        }
    }
}
