FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY Salgadin/Salgadin.csproj Salgadin/
RUN dotnet restore Salgadin/Salgadin.csproj

COPY Salgadin/ Salgadin/
WORKDIR /src/Salgadin
RUN dotnet publish Salgadin.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
EXPOSE 10000
ENV ASPNETCORE_ENVIRONMENT=Production
COPY --from=build /app/publish .
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-10000} dotnet Salgadin.dll"]
