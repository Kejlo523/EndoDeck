using System.Text.Json;

static class Program
{
    private static readonly JsonSerializerOptions JsonOptions = new() { IncludeFields = true };

    private static void Emit(object value)
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;
        Console.WriteLine(JsonSerializer.Serialize(value, JsonOptions));
    }

    public static int Main(string[] args)
    {
        try
        {
            var command = args.FirstOrDefault() ?? "list";
            switch (command)
            {
                case "list": Emit(EndoDeck.Audio.List()); break;
                case "status": Emit(EndoDeck.Audio.Status()); break;
                case "devices": Emit(new { devices = EndoDeck.Audio.ListOutputDevices() }); break;
                case "master": EndoDeck.Audio.SetMaster(int.Parse(args[1])); Emit(new { ok = true }); break;
                case "session": EndoDeck.Audio.SetSession(int.Parse(args[1]), int.Parse(args[2])); Emit(new { ok = true }); break;
                case "microphone-toggle": Emit(new { ok = true, muted = EndoDeck.Audio.ToggleMicrophone() }); break;
                case "process-toggle": Emit(EndoDeck.Audio.ToggleProcess(args[1])); break;
                case "set-default": EndoDeck.Audio.SetDefaultOutput(args[1]); Emit(new { ok = true }); break;
                default: throw new ArgumentException($"Unknown helper command: {command}");
            }
            return 0;
        }
        catch (Exception error)
        {
            Console.Error.WriteLine(error.Message);
            return 1;
        }
    }
}
