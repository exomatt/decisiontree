from locust import HttpLocust, TaskSet, task, seq_task, TaskSequence


class ExperimentBehavior(TaskSequence):
    token = ""
    experiments_ids = list()

    def on_start(self):
        """ on_start is called when a Locust start before any task is scheduled """
        self.login()

    def on_stop(self):
        """ on_stop is called when the TaskSet is stopping """
        self.logout()

    def login(self):
        response = self.client.post("/api/auth/login", {"username": "locust", "password": "locust"})
        json = response.json()
        self.token = json["token"]

    def logout(self):
        self.client.headers['Authorization'] = f'Token {self.token}'
        self.client.post("/api/auth/logout")

    @task(1)
    def user_profile(self):
        self.client.headers['Authorization'] = f'Token {self.token}'
        self.client.get("/api/auth/user")

    @task(2)
    def user_files(self):
        self.client.headers['Authorization'] = f'Token {self.token}'
        self.client.get("/api/auth/userFiles")

    @task(3)
    def user_experiments(self):
        self.client.headers['Authorization'] = f'Token {self.token}'
        self.client.get("/api/experiment")

    @seq_task(1)
    def create_experiment(self):
        self.client.headers['Authorization'] = f'Token {self.token}'
        response = self.client.post("/api/experiment/", {
            "name": "testowa",
            "description": "test opis",
            "config_file_name": "a1.xml",
            "data_file_name": "chess3x3x10000",
            "test_file_name": "chess3x3x10000",
            "names_file_name": "chess3x3x10000"
        })
        json = response.json()
        id_ = json["id"]
        self.experiments_ids.append(id_)

    @seq_task(2)
    def get_experiment_by_id(self):
        self.client.headers['Authorization'] = f'Token {self.token}'
        id = self.experiments_ids[-1]
        self.client.get(f'/api/experiment/{id}')

    @seq_task(3)
    def delete_experiment(self):
        self.client.headers['Authorization'] = f'Token {self.token}'
        id = self.experiments_ids.pop()
        self.client.get(f'/api/experiment/{id}')
        self.client.delete(f'/api/experiment/{id}')


class WebsiteUser(HttpLocust):
    task_set = ExperimentBehavior
    min_wait = 5000
    max_wait = 9000
