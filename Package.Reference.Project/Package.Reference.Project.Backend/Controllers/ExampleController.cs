using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Package.Reference.Project.Backend.Controllers.Auth;
using Package.Reference.Project.Backend.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Api.Management.Routing;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Filters;

namespace Package.Reference.Project.Backend.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [MapToApi("Package.Reference.Project-api-v1")]
    [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
    [JsonOptionsName(Constants.JsonOptionsNames.BackOffice)]
    [Route("api/v{version:apiVersion}/Package.Reference.Project")]
    public class ExampleController : Controller
    {
        private readonly IExampleService _exampleService;
        private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;
        public ExampleController(IExampleService exampleService, IBackOfficeSecurityAccessor backOfficeSecurityAccessor)
        {
            _exampleService = exampleService;
            _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
        }

        [HttpGet("example")]
        [MapToApiVersion("1.0")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetExampleData()
        {
            IUser currentUser = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser
                            ?? throw new InvalidOperationException("No backoffice user found");

            var data = await _exampleService.GetExampleData();

            data += " user: " + currentUser.Name;

            return Ok(data);
        }
    }
}
