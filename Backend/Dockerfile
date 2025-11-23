
FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
COPY src ./src
RUN chmod +x mvnw
RUN ./mvnw -q -DskipTests package

RUN cp target/backend-0.0.1-SNAPSHOT.jar app.jar

# Do not copy uploads into the image. Use a volume/bind mount at runtime.
VOLUME ["/app/uploads"]

# Expose a default uploads path as an environment variable and pass it
# to the JVM so the application can read it via `app.uploads.path`.
ENV APP_UPLOADS_PATH=/app/uploads

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dapp.uploads.path=${APP_UPLOADS_PATH} -jar app.jar"]