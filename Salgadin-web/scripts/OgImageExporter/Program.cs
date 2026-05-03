using System.IO;
using System.Threading.Tasks;
using System.Windows;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.Wpf;

namespace OgImageExporter;

internal static class Program
{
    [STAThread]
    private static int Main(string[] args)
    {
        if (args.Length < 2)
        {
            Console.Error.WriteLine("Usage: OgImageExporter <input-svg> <output-png>");
            return 1;
        }

        var inputSvg = Path.GetFullPath(args[0]);
        var outputPng = Path.GetFullPath(args[1]);

        if (!File.Exists(inputSvg))
        {
            Console.Error.WriteLine($"Input SVG not found: {inputSvg}");
            return 1;
        }

        Directory.CreateDirectory(Path.GetDirectoryName(outputPng)!);

        var app = new Application
        {
            ShutdownMode = ShutdownMode.OnExplicitShutdown
        };

        var window = new Window
        {
            Width = 1200,
            Height = 630,
            WindowStyle = WindowStyle.None,
            ResizeMode = ResizeMode.NoResize,
            ShowInTaskbar = false,
            Left = -20000,
            Top = -20000,
            Content = CreateWebView()
        };

        var completion = new TaskCompletionSource<int>();

        window.Loaded += async (_, _) =>
        {
            try
            {
                var webView = (WebView2)window.Content;
                await webView.EnsureCoreWebView2Async();

                var html = BuildHtml(
                    File.ReadAllText(inputSvg),
                    new Uri(Path.GetDirectoryName(inputSvg)! + Path.DirectorySeparatorChar).AbsoluteUri);
                var navigationCompleted = new TaskCompletionSource<bool>();

                void OnNavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs eventArgs)
                {
                    webView.CoreWebView2.NavigationCompleted -= OnNavigationCompleted;

                    if (eventArgs.IsSuccess)
                    {
                        navigationCompleted.TrySetResult(true);
                        return;
                    }

                    navigationCompleted.TrySetException(
                        new InvalidOperationException($"Navigation failed with status {eventArgs.WebErrorStatus}."));
                }

                webView.CoreWebView2.NavigationCompleted += OnNavigationCompleted;
                webView.NavigateToString(html);

                await navigationCompleted.Task;
                await Task.Delay(900);

                await using var output = File.Create(outputPng);
                await webView.CoreWebView2.CapturePreviewAsync(
                    CoreWebView2CapturePreviewImageFormat.Png,
                    output);

                completion.TrySetResult(0);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                completion.TrySetResult(1);
            }
            finally
            {
                window.Close();
                app.Shutdown();
            }
        };

        app.Run(window);
        return completion.Task.GetAwaiter().GetResult();
    }

    private static WebView2 CreateWebView() => new()
    {
        Width = 1200,
        Height = 630
    };

    private static string BuildHtml(string svgMarkup, string baseHref) =>
        $$"""
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <base href="{{baseHref}}" />
            <style>
              html, body {
                margin: 0;
                width: 1200px;
                height: 630px;
                overflow: hidden;
                background: #130f0e;
              }

              body > svg {
                display: block;
                width: 1200px;
                height: 630px;
              }
            </style>
          </head>
          <body>
            {{svgMarkup}}
          </body>
        </html>
        """;
}
