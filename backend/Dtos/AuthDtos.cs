namespace MathTrack.Api.Dtos;

public record RegisterRequest(string Email, string Password, string FullName);
public record LoginRequest(string Email, string Password);

public record UserDto(int Id, string Email, string FullName, string Role);
public record LoginResponse(string Token, UserDto User);
