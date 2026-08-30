#r "nuget: Microsoft.AspNetCore.Mvc.Testing, 8.0.0"
using System;
using System.Net.Http;
using System.Threading.Tasks;

// We need to run the application to see the 500 error body.
// The easiest way is to use curl to hit the endpoint against the running dev server, or wait for the tests.
