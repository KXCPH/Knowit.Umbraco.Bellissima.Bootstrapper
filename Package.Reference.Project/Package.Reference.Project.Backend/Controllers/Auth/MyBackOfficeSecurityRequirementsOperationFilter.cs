using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Api.Management.Routing;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Web.Common.Authorization;

namespace Package.Reference.Project.Backend.Controllers.Auth
{
    public class MyBackOfficeSecurityRequirementsOperationFilter : BackOfficeSecurityRequirementsOperationFilterBase
    {
        protected override string ApiName => "Package.Reference.Project-api-v1";
    }

    public class MyConfigureSwaggerGenOptions : IConfigureOptions<SwaggerGenOptions>
    {
        public void Configure(SwaggerGenOptions options)
        {
            options.SwaggerDoc("Package.Reference.Project-api-v1", new OpenApiInfo { Title = "Package.Reference.Project v1", Version = "1.0" });
            options.OperationFilter<MyBackOfficeSecurityRequirementsOperationFilter>();
        }
    }

    public class MyComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
            => builder.Services.ConfigureOptions<MyConfigureSwaggerGenOptions>();
    }
}
