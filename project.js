function Project(id,name,description,site,author,size,creationDate) {
  this.$id = id;
  this.name = name;
  this.description = description;
  this.site = site;
  this.author = author;
  this.size = size;
  this.creationDate = creationDate;
}

function Projects() {
  projects = [];
  this.projects = projects;
  this.loaded = 0;

  this.add = function(prj) {
    projects.splice(projects.length,0,prj);
  }

  this.get = function(id) {
    for(var i=0;i<projects.length;i++) {
      var prj = projects[i];
      if(prj.$id == id)
        return prj;
    }
  }

  this.remove = function(id) {
    for(var i=0;i<projects.length;i++) {
      if(projects[i].$id == id) {
        projects.splice(i,1);
        return;
      }
    }
  }

  this.update = function(itemOrId) {
    alert(itemOrId);
  }
}

angular.projects = new Projects();

angular.module('project',['ngGrid']).
  factory('Projects', function() {
    return angular.projects;
  }).
  config(function($routeProvider) {
    $routeProvider.
    when('/', {controller:ListCtrl, templateUrl:'list.html'}).
    when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
    when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
    otherwise({redirectTo:'/'});
  });

     
function ListCtrl($scope, $http, Projects) {
  var preColumn;

  if(Projects.loaded == 0) {
    $http.get("projects.json").success(function(data) {
      for(var i = 0;i<data.length;i++) {
        var itm = data[i];
        Projects.add(new Project(itm.$id,itm.name,itm.description,itm.site,itm.author,itm.size,itm.creationDate));
      }
    });
    Projects.loaded = 1;
  }
  $scope.projects = Projects;
  
  $http.get("projects.json").success(function(data) {
    $scope.gridData = data;
  }); // for ng-grid
  $scope.gridOptions = { 
    data: 'gridData',
    sortInfo: {fields: ['size'], directions: ['asc']},
    enableCellSelection: true,
    enableRowSelection: false,
    enableCellEdit: true,
    columnDefs: [{field: 'size', displayName:'Size', enableCellEdit: true},
                 {field: 'name', displayName: 'Name', enableCellEdit: true}, 
                 {field: 'description', displayName:'Description', enableCellEdit: true},
                 {field: 'site', displayName:'Site URL', enableCellEdit: true},
                 {field: 'author', displayName:'Author', enableCellEdit: true},
                 {field: 'creationDate', displayName:'Creation Date', enableCellEdit: true},
                ] 
  }; // for ng-grid
  $scope.sort = {column: 'random', reverse: !'reverse', clickCount: 0};
  $scope.destroy = function(project) {
    Projects.remove(project.$id);
  };
  $scope.random = function(){
    return Math.random();
  };
  $scope.sortClick = function(column) {
    var sort = $scope.sort;
    var random = $scope.random;

    if(preColumn != column) {
      sort.clickCount = 1;
      preColumn = column;
    };

    if(sort.clickCount%3 === 0) {
      sort.column = column;
      sort.reverse = 'reverse';
      sort.clickCount += 1;
    }
    else if(sort.clickCount%3 === 1) {
      sort.column = column;
      sort.reverse = !'reverse';
      sort.clickCount += 1;
    } 
    else {
      sort.column = random;
      sort.reverse = '';
      sort.clickCount += 1;
    };
  };
}
     
function CreateCtrl($scope, $location, $timeout, Projects) {
  $scope.project = new Project();
  $scope.save = function() {
    $scope.project.$id = randomString(5,"abcdefghijklmnopqrstuvwxyz0123456789");
    Projects.add(angular.copy($scope.project));
    $location.path('/');
  }
}

function EditCtrl($scope, $location, $routeParams, Projects) {
   $scope.project = angular.copy(Projects.get($routeParams.projectId));
   $scope.isClean = function() {
      return angular.equals(Projects.get($routeParams.projectId), $scope.project);
   }
   $scope.destroy = function() {
      Projects.remove($routeParams.projectId);
      $location.path('/');
   };
   $scope.save = function() {
      var prj = Projects.get($routeParams.projectId);
      prj.name = $scope.project.name;
      prj.description = $scope.project.description;
      prj.site = $scope.project.site;
      $location.path('/');
   };
}

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) 
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}
